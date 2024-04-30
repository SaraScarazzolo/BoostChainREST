import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { validateRequest } from 'zod-express-middleware';
import { z } from 'zod';

import { genUUID } from '../../utils/uuid.js';
import JSONDatabase from '../../utils/database.js';
import { DATABASE_PATH } from '../../utils/constants.js';

const router = express.Router();
router.use(bodyParser.json());

const DB = new JSONDatabase(DATABASE_PATH);

router.post(
    '/blocks/add',

    cors({ maxAge: 600 }), // allow requests from all origins with 10 min cache

    validateRequest({
        body: z.object({
            email: z.string(),
            description: z.string(),
        }),
    }),

    async (req, res) => {
        const block = {
            email: req.body.email,
            description: req.body.description,
            waiting: true,
            upvotes: 0,
            uuid: genUUID(req.body.description),
        };

        try {
            await DB.addBlock(block);

            // https://stackoverflow.com/a/70514160
            delete block['email']; // hide email

            res.status(200).json({
                success: true,
                block,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
);

router.get(
    '/blocks',

    cors({ maxAge: 600 }), // allow requests from all origins with 10 min cache

    async (req, res) => {
        try {
            const blocks = (await DB.read()).map((block) => {
                delete block['email']; // hide email
                return block;
            });

            res.status(200).json({
                success: true,
                blocks,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
);

router.patch(
    '/blocks/:uuid/upvote',

    cors({ maxAge: 600 }), // allow requests from all origins with 10 min cache

    async (req, res) => {
        try {
            const block = await DB.upvoteBlock(req.params.uuid);

            delete block['email']; // hide email

            res.status(200).json({
                success: true,
                block,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
);

export { router };
