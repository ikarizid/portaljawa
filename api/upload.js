import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Parse multipart form data
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const bodyStr = buffer.toString();

    // Extract boundary
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) return res.status(400).json({ error: 'No boundary found' });

    const boundary = '--' + boundaryMatch[1];
    const parts = bodyStr.split(boundary).filter(p => p && p !== '--\r\n' && p !== '--');

    let fileBuffer = null;
    let fileName = '';
    let mimeType = 'image/jpeg';

    for (const part of parts) {
      if (part.includes('Content-Disposition') && part.includes('filename=')) {
        const nameMatch = part.match(/filename="([^"]+)"/);
        const typeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
        if (nameMatch) fileName = nameMatch[1];
        if (typeMatch) mimeType = typeMatch[1].trim();

        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        const rawData = part.slice(dataStart, dataEnd > dataStart ? dataEnd : undefined);
        fileBuffer = Buffer.from(rawData, 'binary');
      }
    }

    if (!fileBuffer || !fileName) {
      return res.status(400).json({ error: 'File tidak ditemukan' });
    }

    // Upload ke Supabase Storage
    const uniqueName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const { data, error } = await supabase.storage
      .from('foto-berita')
      .upload(uniqueName, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) return res.status(500).json({ error: error.message });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('foto-berita')
      .getPublicUrl(uniqueName);

    return res.status(200).json({ url: urlData.publicUrl, path: uniqueName });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}