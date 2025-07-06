// File: api/projects.js

import { createClient } from '@supabase/supabase-js'

// ─── Initialize Supabase with server-only keys ─────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // ─── GET /api/projects → list all projects ───────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, tags, image_url, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('GET error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json(data)
  }

  // ─── POST /api/projects → add a new project ──────────────────────────────
  if (req.method === 'POST') {
    try {
      const { title, tags, image_base64 } = req.body

      if (!title || !Array.isArray(tags) || !image_base64) {
        return res.status(400).json({ error: 'Missing title, tags or image_base64' })
      }

      // Option A: store base64 directly
      const { data, error } = await supabase
        .from('projects')
        .insert([{ title, tags, image_base64 }])
        .select('id, created_at')
        .single()

      if (error) throw error
      return res.status(201).json(data)

    } catch (err) {
      console.error('POST error:', err)
      return res.status(500).json({ error: err.message })
    }
  }

  // ─── Method Not Allowed ──────────────────────────────────────────────────
  res.setHeader('Allow', ['GET','POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
