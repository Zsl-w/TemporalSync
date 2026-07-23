import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

const lexoraApiPlugin = () => ({
  name: 'api-lexora-middleware',
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const reqPath = req.url ? req.url.split('?')[0] : '';

      if (reqPath === '/api/lexora/explain' && req.method === 'POST') {
        let bodyStr = '';
        req.on('data', (chunk: any) => bodyStr += chunk);
        req.on('end', async () => {
          try {
            const { query } = JSON.parse(bodyStr || '{}');
            const apiKey = process.env.DEEPSEEK_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: '本地 .env 文件中未配置 DEEPSEEK_API_KEY。' }));
              return;
            }
            const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
            const systemPrompt = `You are Lexora, an AI professional knowledge companion.
Your job is to explain unfamiliar specialist concepts (especially in AI/ML, Medicine, Biology, Engineering, etc.) in a structured format.
Given a user query (term or concept), produce a JSON object with EXACTLY the following structure:
{
  "id": string (kebab-case identifier e.g. "synaptic-plasticity"),
  "domain": string (e.g. "MEDICINE · NEUROSCIENCE" or "AI · MACHINE LEARNING"),
  "english": string (canonical English term),
  "chinese": string (canonical Chinese translation),
  "pronunciation": string (IPA phonetic transcription e.g. "/sɪˈnæptɪk/"),
  "conciseDefinition": string (1-3 sentences concise definition in Chinese),
  "deepExplanation": array of strings (2-4 paragraphs in Chinese explaining mechanisms, background, applications),
  "learningState": "new",
  "relations": array of objects:
    [
      { "id": string, "type": "prerequisite", "english": string, "chinese": string },
      { "id": string, "type": "current", "english": string, "chinese": string },
      { "id": string, "type": "derived", "english": string, "chinese": string },
      { "id": string, "type": "analogy", "english": string, "chinese": string }
    ]
}
Return ONLY valid JSON matching this schema. Do not include markdown code block syntax.`;

            const response = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: `Please explain the concept: "${query}"` }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3
              }),
              signal: AbortSignal.timeout(25000),
            });

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`DeepSeek API error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const resultText = data.choices?.[0]?.message?.content;
            const parsed = typeof resultText === 'string' ? JSON.parse(resultText) : resultText;

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(parsed));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message || String(err) }));
          }
        });
        return;
      }

      if (reqPath === '/api/lexora/tutor' && req.method === 'POST') {
        let bodyStr = '';
        req.on('data', (chunk: any) => bodyStr += chunk);
        req.on('end', async () => {
          try {
            const { conceptEnglish, conceptChinese, conciseDefinition, question } = JSON.parse(bodyStr || '{}');
            const apiKey = process.env.DEEPSEEK_API_KEY;
            if (!apiKey) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ error: '本地 .env 文件中未配置 DEEPSEEK_API_KEY。' }));
              return;
            }
            const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
            const systemPrompt = `You are Lexora AI Tutor, a patient, clear, and encouraging professional AI tutor.
The user is currently studying the concept: "${conceptEnglish || ''} (${conceptChinese || ''})".
Context definition: "${conciseDefinition || ''}".
Answer the user's follow-up question or request in clear, friendly, and structured Markdown (in Chinese). Use bullet points, bold text, or code/math blocks where helpful. Keep the answer focused on helping the user master this concept.`;

            const response = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: question }
                ],
                temperature: 0.5
              }),
              signal: AbortSignal.timeout(25000),
            });

            if (!response.ok) {
              const errText = await response.text();
              throw new Error(`DeepSeek API error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            const answer = data.choices?.[0]?.message?.content || '';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ answer }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message || String(err) }));
          }
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), lexoraApiPlugin()],
    assetsInclude: ['**/*.glb'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
