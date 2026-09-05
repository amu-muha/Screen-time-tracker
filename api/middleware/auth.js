import crypto from 'crypto'
import pool from '../config/db.js'

export async function deviceAuth(req,res,next){
    const apiKey = req.header('x-api-key')
    if(!apiKey){
        return res.status(401).json({error: 'missing X-API-Key header'})
    }
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    try {
        const result = await pool.query(
            'SELECT id,label FROM devices WHERE api_key_hash = $1',
           [apiKeyHash] 
        )

        if(result.rows.length === 0){
            return res.status(401).json({error: 'invalid API key'})
        }
        req.device = result.rows[0]; // { id, label } — available to downstream routes
    await pool.query(`UPDATE devices SET last_seen_at = now() WHERE id = $1`, [req.device.id]);
    next();
    }
    catch (err) {
    console.error(err);
    res.status(500).json({ error: 'auth check failed' });
  }


}