const fs = require('fs');
let code = fs.readFileSync('src/server.ts', 'utf8');

// Fix 1: Stop retrying on spending cap error
const oldRetryCheck = "const isTransient = err?.status === 429 || err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('429');";
const newRetryCheck = `const errStr = String(err?.message || '').toLowerCase();
            const isSpendingCap = errStr.includes('spending cap') || errStr.includes('resource_exhausted') || errStr.includes('exceeded');
            const isTransient = !isSpendingCap && (err?.status === 429 || err?.status === 503 || errStr.includes('503') || errStr.includes('429'));`;
code = code.replace(oldRetryCheck, newRetryCheck);

// Fix 2: Break the loop if spending cap error occurs
const oldCatch = `      } catch (itemGenErr) {
        console.error('[Auto-Pilot] Error processing item:', itemGenErr);
      }`;
const newCatch = `      } catch (itemGenErr: any) {
        console.error('[Auto-Pilot] Error processing item:', itemGenErr);
        const errStr = String(itemGenErr?.message || '').toLowerCase();
        if (errStr.includes('spending cap') || errStr.includes('resource_exhausted') || errStr.includes('exceeded')) {
          console.error('[Auto-Pilot] 🛑 FATAL: Monthly spending cap exceeded. Aborting Auto-Pilot sync.');
          throw new Error('Gemini API monthly spending cap exceeded. Please check your AI Studio billing.');
        }
      }`;
code = code.replace(oldCatch, newCatch);

fs.writeFileSync('src/server.ts', code);
