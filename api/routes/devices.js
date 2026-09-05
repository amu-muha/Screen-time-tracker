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

export default devicesRouter;