import express from "express"
import crypto from "crypto"
import pool from "../config/db.js"

const devicesRouter = express.Router()

devicesRouter.post("/", async(req, res)=>{
    const {label} = req.body

    if(!label){
        return res.status(400).json({error: 'label is required'})
    }

    const apiKey = crypto.randomBytes(32).toString('hex')
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
 
    try{const result = await pool.query(
        "INSERT INTO devices (label, api_key_hash) VALUES ($1, $2) RETURNING id, label, created_at",
        [label, apiKeyHash]
    )
    
    res.status(201).json({
      device: result.rows[0],
      api_key: apiKey // ONLY time this is ever returned
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'device registration failed' });
  }
});

devicesRouter.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, label, capture_titles, created_at, last_seen_at FROM devices WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'device not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'query failed' });
  }
});

devicesRouter.patch('/:id', async (req, res) => {
  const { label, capture_titles } = req.body;
  try {
    const result = await pool.query(
      `UPDATE devices SET
         label = COALESCE($1, label),
         capture_titles = COALESCE($2, capture_titles)
       WHERE id = $3
       RETURNING id, label, capture_titles, created_at, last_seen_at`,
      [label ?? null, capture_titles ?? null, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'device not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'update failed' });
  }
});
export default devicesRouter;