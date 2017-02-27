import * as fs from 'fs';
import * as mkdir from 'mkdirp';
import { Promise } from 'es6-promise';
import { JvcConfig } from '../models/JvcConfig';

const ERR_NOT_JVC = 'Error: This directory is not a JVC';
const ERR_INVALID_JSON = 'Error: Invalid JVC JSON file';

const JVC_DIR = '/.jvc';
const JVC_JSON = '/jvc.json';

export class Jvc {
    private dir = process.cwd() + JVC_DIR;
    private jsonFile = process.cwd() + JVC_DIR + JVC_JSON;

    private jvcConfig: JvcConfig;

    private onReadyFunctions: Function[] = [];

    private isReady: boolean = false;

    constructor() {
        if (!this.isJvc()) {
            console.log(ERR_NOT_JVC);
            process.exit(0);
        } else {
            this.getJvc().then((config) => {
                this.jvcConfig = config;
                this.isReady = true;
            }).then(() => {
                this.onReadyFunctions.forEach((func) => {
                    func();
                });
            });
        }
    }

    private isJvc = (): boolean => {
        return fs.existsSync(this.dir)
            && fs.existsSync(this.jsonFile);
    };

    private createJvc = (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            mkdir(this.dir, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    private createJson = (email: string): Promise<void> => {
        var jvcJson: string = JSON.stringify(new JvcConfig(0, email));
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(this.jsonFile, jvcJson, { flag: 'w' }, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    };

    private getJvc = (): Promise<JvcConfig> => {
        return new Promise<JvcConfig>((resolve, reject) => {
            if (this.isJvc()) {
                fs.readFile(this.jsonFile, 'utf8', (err, data) => {
                    if (data == null || data == '') reject(ERR_INVALID_JSON);

                    if (err) reject(err);
                    else resolve(JSON.parse(data));
                });
            } else {
                reject(ERR_NOT_JVC);
            }
        });
    };

    public onReady = (func: Function) => {
        if (this.isReady) func();
        else this.onReadyFunctions.push(func);
    };

    public save = () => {

    };
}