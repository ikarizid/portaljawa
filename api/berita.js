import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET
  if (req.method === 'GET') {
    const showAll = req.query.all === 'true';
    let query = supabase.from('berita').select('*').order('created_at', { ascending: false });
    if (!showAll) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST
  if (req.method === 'POST') {
    const { judul, isi, kategori, penulis, status, foto_url } = req.body;
    if (!judul) return res.status(400).json({ error: 'Judul wajib diisi' });
    const { data, error } = await supabase
      .from('berita')
      .insert([{ judul, isi, kategori, penulis, status: status || 'published', foto_url }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }

  // DELETE
  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID wajib diisi' });
    const { error } = await supabase.from('berita').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Berita berhasil dihapus' });
  }

  return res.status(405).json({ error: 'Method tidak diizinkan' });
}