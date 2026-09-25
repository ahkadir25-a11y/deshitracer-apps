// One branded frame for the emails we send people, so a welcome from the
// business side and one from the member side arrive looking like the same
// company. Styles are inline-ish and in a <style> block on purpose: email
// clients drop external stylesheets.
//
// The older per-module templates each carried their own copy of this markup.
// New emails should build on this instead of copying it again.
export const emailShell = (subject: string, bodyHtml: string) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <style>
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f6f6; }
      .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 6px; box-shadow: 0 0 10px rgba(0,0,0,0.05); padding: 30px; }
      .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e6e6e6; }
      .header h1 { color: #333333; margin: 0; }
      .content { padding: 20px 0; font-size: 16px; color: #555555; line-height: 1.6; }
      .card { background: #f4f6fb; border-radius: 8px; padding: 14px 16px; margin: 18px 0; font-size: 15px; color: #333333; }
      .footer { margin-top: 30px; font-size: 14px; text-align: center; color: #999999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Desi Tracker</h1>
      </div>
      <div class="content">
${bodyHtml}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Desi Tracker. All rights reserved.
      </div>
    </div>
  </body>
</html>`;

// Anything a person typed can end up inside these emails. Escape it so a name
// containing < or & cannot break the markup.
export const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
