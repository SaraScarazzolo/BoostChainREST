import fs from 'node:fs/promises';
import { UPVOTES_FOR_CONFIRMATION } from './constants.js';

export default class JSONDatabase {
    constructor(dbPath) {
        this.dbPath = dbPath;
    }

    addBlock = async (block) => {
        await this.initDB();

        const data = await this.read();
        data.push(block);

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));
    };

    upvoteBlock = async (uuid) => {
        await this.initDB();

        let data = await this.read();

        let block = null;
        data = data.map((b) => {
            if (b.uuid === uuid) {
                block = { ...b, upvotes: b.upvotes + 1 };
                return block;
            }
            return b;
        });

        if (!block) throw new Error('Cannot find block with UUID ' + uuid);

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));

        if (block.upvotes >= UPVOTES_FOR_CONFIRMATION) block = await this.approveBlock(uuid);

        return block;
    };

    approveBlock = async (uuid) => {
        await this.initDB();

        let data = await this.read();

        let block = null;
        data = data.map((b) => {
            if (b.uuid === uuid) {
                block = { ...b, waiting: false };
                return block;
            }
            return b;
        });

        if (!block) throw new Error('Cannot find block with UUID ' + uuid);

        await fs.writeFile(this.dbPath, JSON.stringify(data, null, 4));

        return block;
    };

    initDB = async () => {
        try {
            await fs.access(this.dbPath);
        } catch (err) {
            if (err.code === 'ENOENT') await fs.writeFile(this.dbPath, '[]');
            else console.error(`Error creating database '${this.dbPath}':`, err);
        }
    };

    read = async () => {
        await this.initDB();
        return JSON.parse(await fs.readFile(this.dbPath, 'utf8'));
    };
}
