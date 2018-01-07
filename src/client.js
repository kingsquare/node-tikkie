// @flow

import {TikkieConfig} from './config';

export class TikkieClient {
    config: TikkieConfig

    constructor(config: TikkieConfig) {
        this.config = config;
    }
};
