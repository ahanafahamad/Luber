import http from 'http';
import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

const PORT = process.env.PORT;
const app = express();


app.set('trusted proxy', true);

app.get('/:user/:repo', (req, res)=>{
    const { user, repo } = req.params;
    const target = `https://raw.githack.com/${user}/${repo}/main/index.html`;   
    // jsDelivr Format: https://cdn.jsdelivr.net/gh/user/repo@branch/file
// const target = `https://cdn.jsdelivr.net/gh/${user}/${repo}@main/index.html`;
    res.send(`
        <style>
        * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    }
    </style>
     <iframe src="${target}" style="width:100%; height: 100vh; border:none;"></iframe>

    `);
})
app.get('/deploy', (req : Request, res : Response)=>{
    let css = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: rgb(2, 6, 15);
    color: #fff;
    overflow-x: hidden;
}

::-webkit-scrollbar {
    display: none;
}

/* --- Search Section --- */
.search-container {
    width: 90%;
    max-width: 800px;
    margin: 100px auto 30px;
    display: flex;
    gap: 10px;
}

.gh-input {
    flex: 1;
    background: rgb(5, 9, 19);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 20px;
    border-radius: 12px;
    color: #fff;
    outline: none;
    transition: border 0.3s ease;
}

.gh-input:focus {
    border-color: rgb(245, 0, 245); /* Purple accent */
}

.fetch-btn {
    background: #fff;
    color: #000;
    border: none;
    padding: 0 25px;
    border-radius: 12px;
    font-weight: 800;
    cursor: pointer;
    text-transform: uppercase;
    transition: transform 0.2s ease;
}

.fetch-btn:active {
    transform: scale(0.95);
}

/* --- Repo Grid --- */
.repo-grid {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto 50px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

/* --- Repo Card --- */
.repo-card {
    background-color: rgb(0, 0, 0);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 20px;
    border-radius: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.repo-card:hover {
    border-color: rgba(245, 0, 245, 0.5);
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.repo-name {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 10px;
    color: rgb(221, 151, 0); /* Orange accent */
}

.repo-info {
    font-family: monospace;
    font-size: 0.85rem;
    background: rgb(2, 6, 15);
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 20px;
    line-height: 1.6;
}

.label { color: rgb(219, 97, 97); } /* Red accent */
.value { color: rgb(36, 36, 253); }  /* Blue accent */

/* --- Host Button --- */
.host-btn {
    width: 100%;
    background: transparent;
    border: 1px solid #fff;
    color: #fff;
    padding: 10px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    text-align: center;
}

.host-btn:hover {
    background: #fff;
    color: #000;
}

/* --- Loading State (Optional) --- */
.loading {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
}`
let js = `
    const userNameInput = document.getElementById('user-input');
    const fetchBtn = document.getElementById('fetchBtn');
    const repoGrid = document.getElementById('repo_grid');

    // Attach event listener
    fetchBtn.addEventListener('click', getRepo);

    async function getRepo() {
        const user = userNameInput.value;
        if (!user) return alert("Please enter a username");

        repoGrid.innerHTML = '<p class="loading">Scanning GitHub sectors...</p>';

        try {
            const res = await fetch(\`https://api.github.com/users/\${user}/repos\`);
            const repos = await res.json();

            let listHtml = '';
            repos.forEach(rep => {
                listHtml += \`
                    <div class="repo-card">
                        <p class="repo-name">\${rep.name}</p>
                        <div class="repo-info">
                            <span class="label">lang</span>: <span class="value">\${rep.language || 'Plain'}</span><br>
                            <span class="label">stars</span>: <span class="value">\${rep.stargazers_count}</span>
                        </div>
                        <button class="host-btn" onclick="hostRepo('\${user}', '\${rep.name}')">Initialize Hosting</button>
                    </div>
                \`;
            });
            repoGrid.innerHTML = listHtml;
        } catch (err) {
            repoGrid.innerHTML = '<p style="color:red">Failed to fetch repositories.</p>';
        }
    }

    function hostRepo(user, repo) {
        // Redirect to the backend action to start cloning
       window.location.href = '/' + user + '/' + repo;
    }
    `;
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LUBER | Deploy Site</title>
    <style>${css}</style>
</head>
<body>
<h1 style="text-align: center; margin-top: 100px;">Deploy Site</h1>
<div class="search-container">
        <input type="text" class="gh-input" id="user-input" placeholder="Enter your github user name..."/><button id="fetchBtn" class='fetch-btn'>Search</button>
    </div>
    <div class="repo-grid" id="repo_grid"></div>
    <script>${js}</script>
</body>
</html>`;
res.send(html)
})
app.get('/', (req : Request, res : Response)=>{
    let html = `
 <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>LUBER | Server Dashboard</title>
    <style>
        :root {
            --bg-deep: rgb(2, 6, 15);
            --bg-card: rgba(15, 23, 42, 0.7);
            --accent-green: #10b981;
            --accent-blue: #3b82f6;
            --accent-pink: #d946ef;
            --accent-orange: #f59e0b;
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
            
            /* Fluid Typography */
            --fs-xs: clamp(0.65rem, 0.6rem + 0.25vw, 0.8rem);
            --fs-base: clamp(0.85rem, 0.8rem + 0.4vw, 1.1rem);
            --fs-lg: clamp(1.2rem, 1rem + 1vw, 1.75rem);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        body {
            background-color: var(--bg-deep);
            /* Dynamic background that stays crisp at any resolution */
            background-image: 
                radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%),
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: 100% 100%, 30px 30px, 30px 30px;
            color: var(--text-main);
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
        }

        header {
            background: rgba(5, 9, 19, 0.85);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            width: 100%;
            height: clamp(56px, 8vh, 72px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 clamp(1rem, 5vw, 3rem);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .logo {
            font-size: var(--fs-base);
            font-weight: 800;
            letter-spacing: 0.2em;
            background: linear-gradient(90deg, #fff, var(--accent-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            white-space: nowrap;
        }

        .status-wrapper {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .node-label {
            display: none; /* Hidden on small mobile to save space */
            font-size: var(--fs-xs);
            color: var(--text-dim);
            text-transform: uppercase;
        }

        @media (min-width: 640px) {
            .node-label { display: block; }
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.1);
            padding: 4px 10px;
            border-radius: 99px;
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: var(--accent-green);
            font-size: var(--fs-xs);
            font-weight: 700;
        }

        .pulse {
            width: 8px;
            height: 8px;
            background-color: var(--accent-green);
            border-radius: 50%;
            animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        main {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 2rem 1rem;
        }

        .container {
            width: 100%;
            max-width: 900px;
            background: var(--bg-card);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: clamp(1.25rem, 5vw, 3rem);
            border-radius: clamp(1rem, 3vw, 2rem);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
            position: relative;
        }

        h1 {
            font-size: var(--fs-lg);
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 12px;
            letter-spacing: -0.02em;
        }

        h1::before {
            content: '';
            width: 4px;
            height: 1em;
            background: var(--accent-blue);
            border-radius: 4px;
            flex-shrink: 0;
        }

        .subtitle {
            color: var(--text-dim);
            font-size: var(--fs-xs);
            margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
            display: flex;
            align-items: flex-start;
            gap: 8px;
            line-height: 1.4;
        }

        .subtitle svg { flex-shrink: 0; margin-top: 2px; }

        pre {
            background: rgba(0, 0, 0, 0.4);
            padding: clamp(1rem, 3vw, 2rem);
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
            line-height: 2;
            font-size: var(--fs-base);
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: var(--accent-blue) transparent;
        }

        /* Syntax Highlighting */
        .label { color: var(--accent-blue); }
        .sep { color: var(--text-dim); margin: 0 4px; }
        .v-num { color: var(--accent-pink); }
        .v-str { color: var(--accent-orange); }
        .v-ok { color: var(--accent-green); text-shadow: 0 0 10px rgba(16, 185, 129, 0.3); }

        .btn-host {
            display: block;
            width: fit-content;
            margin-top: clamp(1.5rem, 5vw, 3rem);
            padding: 1rem 2rem;
            background: var(--accent-blue);
            color: white;
            text-decoration: none;
            border-radius: 0.75rem;
            font-weight: 700;
            font-size: var(--fs-base);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: center;
            box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
        }

        @media (max-width: 480px) {
            .btn-host { width: 100%; } /* Full width on tiny phones */
        }

        .btn-host:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 25px rgba(59, 130, 246, 0.5);
            filter: brightness(1.15);
        }

        .btn-host:active {
            transform: translateY(0) scale(0.98);
        }

        /* Scrollbar custom for webkit */
        pre::-webkit-scrollbar { height: 6px; }
        pre::-webkit-scrollbar-thumb { background: var(--accent-blue); border-radius: 10px; }
    </style>
</head>

<body>
    <header>
        <div class="logo">LUBER</div>
        <div class="status-wrapper">
            <span class="node-label">Cluster v1.0.0</span>
            <div class="status-indicator">
                <div class="pulse"></div>
                <span>LIVE</span>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <h1>SYSTEM METRICS</h1>
            <div class="subtitle">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Real-time telemetry established. Data packets synchronized via edge nodes.
            </div>
            
            <pre>
<span class="label">status</span><span class="sep">:</span><span class="v-num">200</span> <span class="v-ok">OK</span>
<span class="label">node_name</span><span class="sep">:</span><span class="v-str">LUBE_EDGE_01</span>
<span class="label">cluster_id</span><span class="sep">:</span><span class="v-str">LUBE-GLOBAL-X</span>
<span class="label">session_id</span><span class="sep">:</span><span id="session_id" class="v-str">FETCHING...</span>
<span class="label">ping</span><span class="sep">:</span><span id="latency" class="v-num">0.000</span><span class="v-str">ms</span></pre>

            <a href="/deploy" class="btn-host">Launch Instance</a>
        </div>
    </main>

    <script>
        const sessionEl = document.getElementById('session_id');
        const latencyEl = document.getElementById('latency');

        function updateSession() {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 15; i++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            sessionEl.textContent = result; 
        }

        function simulateLatency() {
            // Smooth jitter simulation
            let target = Math.random() * 5 + 11; // Base 1.6ms-2.4ms
            let current = parseFloat(latencyEl.textContent);
            
            setInterval(() => {
                const noise = (Math.random() - 0.5) * 2;
                const newVal = Math.max(12, target + noise).toFixed(3);
                latencyEl.textContent = newVal;
            }, 1500);
        }

        // Initialize
        updateSession();
        simulateLatency();

        // Regenerate session ID occasionally
        setInterval(updateSession, 3000);
    </script>
</body>
</html>`;
    res.send(html)
})

const server = http.createServer(app);

server.listen(PORT, ()=>{
    console.log(`>> LOCAL HOST : http://localhost:${PORT}`);
    // console.log(`http://[${userIp}]:${PORT}`);
    const nets = os.networkInterfaces();
   for(const name of Object.keys(nets)){
    for(const net of nets[name]!){
            if(net.family === 'IPv4' && !net.internal){
                console.log(`>> PUBLIC HOST :http://${net.address}:${PORT} (${name})`);
            }
    }
   }
});



export default app;