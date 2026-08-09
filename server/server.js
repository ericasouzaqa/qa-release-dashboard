'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const app = express();

const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use(express.static(path.join(__dirname, '..')));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || '127.0.0.1',
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || '',
      }
    : undefined,
});

app.get('/api/health', function (req, res) {
  res.json({
    status: 'ok',
    version: '1.2.0',
  });
});

app.post('/api/email', async function (req, res) {
  try {
    const { to, product, version, description, items } = req.body || {};

    if (!Array.isArray(to) || !to.length) {
      return res.status(400).json({
        error: 'Nenhum destinatário informado.',
      });
    }

    if (to.length > 25) {
      return res.status(400).json({
        error: 'O limite é de 25 destinatários.',
      });
    }

    const subject = `QA Release — ${product} — ${version}`;

    const htmlItems = Array.isArray(items)
      ? items
          .map(function (item) {
            return `
            <tr>
              <td>${escapeHtml(item.tipo)}</td>
              <td>${escapeHtml(item.ticket)}</td>
              <td>${escapeHtml(item.titulo)}</td>
              <td>${escapeHtml(item.descricao)}</td>
            </tr>
          `;
          })
          .join('')
      : '';

    const html = `
      <html>
        <body style="font-family:Arial,sans-serif;color:#111827">
          <h1>${escapeHtml(product)} — ${escapeHtml(version)}</h1>
          <p>${escapeHtml(description || '')}</p>

          <table border="1" cellpadding="8" cellspacing="0">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ticket</th>
                <th>Título</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              ${htmlItems}
            </tbody>
          </table>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        'QA Release Dashboard <no-reply@qa-release-dashboard.local>',
      to: to.join(','),
      subject,
      html,
    });

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: 'Não foi possível enviar o relatório.',
    });
  }
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.listen(PORT, '127.0.0.1', function () {
  console.log('');
  console.log('==========================================');
  console.log(' QA Release Dashboard v1.2.0');
  console.log('==========================================');
  console.log(` Aplicação: http://127.0.0.1:${PORT}`);
  console.log(' MailHog:   http://127.0.0.1:8025');
  console.log(' SMTP:      127.0.0.1:1025');
  console.log('==========================================');
  console.log('');
});
