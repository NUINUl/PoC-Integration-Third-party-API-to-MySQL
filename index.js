require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in environment.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

app.post('/api/webhook', async (req, res) => {
  try {
    const { order_id, customer_name, email, total_amount, status } = req.body;

    if (
      order_id === undefined ||
      order_id === null ||
      String(order_id).trim() === ''
    ) {
      return res.status(400).json({ error: 'order_id is required.' });
    }
    if (
      customer_name === undefined ||
      customer_name === null ||
      String(customer_name).trim() === ''
    ) {
      return res.status(400).json({ error: 'customer_name is required.' });
    }
    if (email === undefined || email === null || String(email).trim() === '') {
      return res.status(400).json({ error: 'email is required.' });
    }
    if (total_amount === undefined || total_amount === null) {
      return res.status(400).json({ error: 'total_amount is required.' });
    }
    const amountNum = Number(total_amount);
    if (Number.isNaN(amountNum)) {
      return res.status(400).json({ error: 'total_amount must be a number.' });
    }
    if (status === undefined || status === null || String(status).trim() === '') {
      return res.status(400).json({ error: 'status is required.' });
    }

    const row = {
      order_id: String(order_id).trim(),
      customer_name: String(customer_name).trim(),
      email: String(email).trim(),
      total_amount: amountNum,
      status: String(status).trim(),
    };

    const { data, error } = await supabase
      .from('external_orders')
      .upsert(row, { onConflict: 'order_id' })
      .select();

    if (error) {
      console.error('[webhook] Supabase error:', error.message);
      return res.status(502).json({
        error: 'Failed to save order.',
        details: error.message,
      });
    }

    console.log('[webhook] Upsert ok:', row.order_id);
    return res.status(200).json({ message: 'Order saved.', data });
  } catch (err) {
    console.error('[webhook]', err);
    return res.status(500).json({
      error: 'Internal server error.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('external_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[orders] Supabase error:', error.message);
      return res.status(502).json({
        error: 'Failed to fetch orders.',
        details: error.message,
      });
    }

    return res.json(data ?? []);
  } catch (err) {
    console.error('[orders]', err);
    return res.status(500).json({
      error: 'Internal server error.',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

app.use(express.static('public'));

const PORT = Number(process.env.PORT) || 3000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
