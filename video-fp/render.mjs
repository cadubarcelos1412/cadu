import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { spawn } from 'child_process';
const [dir, mode, ...rest] = process.argv.slice(2);
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+dir+'/index.html'); await p.evaluate(()=>document.fonts.ready); await p.waitForTimeout(800);
if (mode==='stills') { for (const t of rest){ await p.evaluate(t=>seek(t),+t); await p.screenshot({path:`${dir}/s_${t}.jpg`,type:'jpeg',quality:80}); } }
else {
  const fps=30, dur=94.5, ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate',''+fps,'-i','-','-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',rest[0]],{stdio:['pipe','ignore','inherit']});
  for(let i=0;i<fps*dur;i++){ await p.evaluate(t=>seek(t),i/fps); const buf=await p.screenshot({type:'jpeg',quality:94});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r)); if(i%300==0) console.log(i); }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r));
}
await b.close();
