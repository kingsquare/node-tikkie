// @flow

import fs from 'fs';
import jwt from 'jsonwebtoken';

import {AccessToken} from './accessToken';

const PRODUCTION_API_URL = 'https://api.abnamro.com';
const PRODUCTION_TOKEN_AUDIENCE = 'https://auth.abnamro.com/oauth/token';
const SANDBOX_API_URL = 'https://api-sandbox.abnamro.com';
const SANDBOX_TOKEN_AUDIENCE = 'https://auth-sandbox.abnamro.com/oauth/token';

export class TikkieConfig {
    _accessToken: AccessToken
    apiKey: string
    useSandbox: boolean
    apiUrl: string
    tokenAudience: string
    privateKey: string
    algorithm: string

    constructor(apiKey: string, useSandbox: boolean = false) {
        this.apiKey = apiKey;
        this.useSandbox = useSandbox;
        this.apiUrl = useSandbox ? SANDBOX_API_URL : PRODUCTION_API_URL;
        this.tokenAudience = useSandbox ? SANDBOX_TOKEN_AUDIENCE : PRODUCTION_TOKEN_AUDIENCE;
    }

    loadPrivateKey(path: string, algorithm: string = 'RS256') {
        this.loadPrivateKeyFromString(fs.readFileSync(path, 'utf8'), algorithm);
    }

    loadPrivateKeyFromString(privateKey: string, algorithm: string = 'RS256') {
        this.privateKey = privateKey;
        this.algorithm = algorithm;
    }

    createHeaders(): Headers {
        const headers: Headers = new Headers();
        headers.append('API-Key', this.apiKey);
        return headers;
    }

    getJsonWebToken(): string {
        return jwt.sign({}, this.privateKey, {
            algorithm: this.algorithm,
            expiresIn: '3m',
            notBefore: '-1m',
            issuer: 'node-tikkie',
            subject: this.apiKey,
            audience: this.tokenAudience
        });
    }

    getAccessToken = async (): Promise<string> => {
        if (!this._accessToken && !this._accessToken.hasExpired()) {
            try {
                const body = new URLSearchParams();
                body.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
                body.append('client_assertion', this.getJsonWebToken());
                body.append('grant_type', 'client_credentials');
                body.append('scope', 'tikkie');

                const response: Response = await fetch(`${this.apiUrl}/v1/oauth/token`, {
                    method: 'POST',
                    headers: this.createHeaders(),
                    body
                });

                const result: Object = await response.json();

                if (response.status >= 200 && response.status <= 399) {
                    this._accessToken = new AccessToken(result);
                } else {
                    throw new Error('test');
                }
            } catch (err) {
                throw err;
            }
        }
        return this._accessToken.token;
    }

    request = async (method: 'GET' | 'POST', endpoint: string, query: Object = {}, data: Object = {}): Promise<Object> => {
        try {
            let token: string;
            try {
                token = await this.getAccessToken();
            } catch (err) {
                return new Error('test');
            }

            const headers: Headers = this.createHeaders();
            headers.append('Authorization', `Bearer ${token}`);

            const response: Response = await fetch(`${this.apiUrl}${endpoint}`, {
                method,
                headers
            });
            const result: Object = await response.json();

            if (response.status >= 200 && response.status <= 399) {
                return result;
            } else {
                throw new Error('test');
            }
        } catch (err) {
            throw err;
        }
    }

    getRequest = async (endpoint: string, query: Object = {}): Promise<Object> => this.request('GET', endpoint, query)
    postRequest = async (endpoint: string, data: Object = {}): Promise<Object> => this.request('POST', endpoint, {}, data)
};
