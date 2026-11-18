// Dependency-free local server: works with an archived dist/ and Node.js alone.
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot=fileURLToPath(new URL('../dist/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.md':'text/plain; charset=utf-8'};
export function startServer({root=defaultRoot,port=5175}={}) {
  const directory=resolve(root);
  const server=createServer(async(req,res)=>{
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    try {
      const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
      let file=resolve(directory,`.${pathname}`);
      if(file!==directory&&!file.startsWith(directory+sep)){res.writeHead(403);res.end();return;}
      let info=await stat(file);
      if(info.isDirectory()){
        if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});res.end();return;}
        file=resolve(file,'index.html');info=await stat(file);
      }
      if(!info.isFile())throw new Error('Not a file');
      res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Content-Length':info.size,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
      if(req.method==='HEAD')res.end();
      else createReadStream(file).on('error',()=>res.destroy()).pipe(res);
    } catch(error){res.writeHead(error instanceof URIError?400:404);res.end('Resource unavailable');}
  });
  return new Promise((accept,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>accept(server));});
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const index=process.argv.indexOf('--port');
  const port=index<0?5175:Number(process.argv[index+1]);
  if(!Number.isInteger(port)||port<0||port>65535)throw new RangeError('Invalid port');
  const server=await startServer({port});
  console.log(`岁时离线版：http://127.0.0.1:${server.address().port}/`);
  console.log('仅监听本机。按 Ctrl+C 停止；不需要 npm 安装或互联网连接。');
}
