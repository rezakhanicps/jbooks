import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface Cell {
    id: string;
    content: string;
    type: 'text' | 'code';
}

export const createCellsRouter = (filename: string, dir: string) => {
    const router = express.Router();

    router.use(express.json());

    const fullPath = path.join(dir, filename);
    router.get('/cells', async (req, res) => {
        try {
            // Read the file
            // Parse a list of cells out of it
            // Send list of cells back to browser
            const result = await fs.readFile(fullPath, { encoding: 'utf-8' });
            res.send(JSON.parse(result));
        } catch (err: any) {
            // If read throws an error
            // Inspect the error, see if it says that the file doesn't exist
            if (err.code === 'ENOENT') {
                //Add code to create a file and add default cells
                await fs.writeFile(fullPath, '[]', 'utf-8');
                res.send([]);
            } else {
                throw err;
            }
        }
    });

    router.post('/cells', async (req, res) => {
        // Take the list of cells from the request obj
        // Serialize them
        const { cells }: { cells: Cell[] } = req.body;

        // Write the cells into the file
        await fs.writeFile(fullPath, JSON.stringify(cells), 'utf-8');

        res.send({ status: 'ok' });
    });

    return router;
};
