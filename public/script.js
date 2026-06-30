
    window.addEventListener('beforeunload', function (e) {
        e.preventDefault();
        e.returnValue = '';
    });
        const esCelular = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (esCelular) {
            document.getElementById('controles').style.display = 'flex';
        }

        const socket = io({ transports: ['websocket', 'polling'] });
        let miPersonaje = null;
        const otrosAvatares = {};
        let x = 0, z = 0;
        let avatarElegido = '👾';
        let miNombre = 'Jugador';
socket.on('disconnect', (reason) => {
    console.log('❌ Desconectado por:', reason);
    if (reason === 'io server disconnect') {
        socket.connect();
    }
});

socket.on('connect_error', (error) => {
    console.log('❌ Error de conexión:', error);
    setTimeout(() => {
        socket.connect();
    }, 1000);
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconectado después de ${attemptNumber} intentos`);
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Intento de reconexión #${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
    console.log('❌ Error al reconectar:', error);
});

socket.on('reconnect_failed', () => {
    console.log('❌ Falló la reconexión');
});
        document.querySelectorAll('.avatar-opcion').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.avatar-opcion').forEach(a => a.classList.remove('seleccionado'));
                this.classList.add('seleccionado');
                avatarElegido = this.dataset.avatar;
            });
        });

        document.getElementById('btn-ingresar').addEventListener('click', () => {
            const input = document.getElementById('nombre-input');
            miNombre = input.value.trim() || 'Jugador';
            
            document.getElementById('selector').style.display = 'none';
            
            crearMiAvatar(avatarElegido, miNombre);
            socket.emit('seleccionar_avatar', { avatar: avatarElegido, nombre: miNombre });
        });

        document.getElementById('nombre-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') document.getElementById('btn-ingresar').click();
        });

socket.on('usuarios_conectados', (cantidad) => {
    document.getElementById('num-usuarios').textContent = cantidad;
});

socket.on('usuarios_existentes', (usuarios) => {
    console.log('📥 Usuarios existentes:', usuarios);
    console.log('🆔 Mi ID es:', socket.id);
    
    usuarios.forEach(u => {
        if (u.id !== socket.id) {
            console.log(`✅ Creando avatar de: ${u.nombre} (${u.id})`);
            crearAvatarOtro(u.id, u.avatar, u.nombre, u.x, u.z);
        } else {
            console.log(`⏭️ Saltando mi propio avatar: ${u.nombre}`);
        }
    });
    
    document.getElementById('num-usuarios').textContent = usuarios.length + 1;
});

socket.on('nuevo_avatar', (data) => {
    console.log('🆕 Nuevo usuario:', data);
    
    if (data.id !== socket.id) {
        crearAvatarOtro(data.id, data.avatar, data.nombre);
        document.getElementById('num-usuarios').textContent = Object.keys(otrosAvatares).length + 1;
    } else {
        console.log('⏭️ Saltando mi propio nuevo avatar');
    }
});

socket.on('movimiento_otro', (data) => {
    if (otrosAvatares[data.id] && data.id !== socket.id) {
        otrosAvatares[data.id].position.x = data.x;
        otrosAvatares[data.id].position.z = data.z;
    }
});

socket.on('usuario_desconectado', (id) => {
    console.log('👋 Desconectado:', id);
    if (otrosAvatares[id]) {
        scene.remove(otrosAvatares[id]);
        delete otrosAvatares[id];
    }
    document.getElementById('num-usuarios').textContent = Object.keys(otrosAvatares).length + 1;
});
       
        
        const chatInput = document.getElementById('chat-input');
        const chatEnviar = document.getElementById('chat-enviar');
        const chatMensajes = document.getElementById('chat-mensajes');

        function agregarMensajeChat(nombre, mensaje, esPropio = false) {
            const div = document.createElement('div');
            div.className = 'mensaje-chat';
            
            const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const nombreColor = esPropio ? '#00ff88' : '#4d96ff';
            
            div.innerHTML = `
                <span class="nombre-chat" style="color: ${nombreColor};">${nombre}</span>
                <span class="texto-chat">: ${mensaje}</span>
                <span class="hora-chat">${hora}</span>
            `;
            
            chatMensajes.appendChild(div);
            chatMensajes.scrollTop = chatMensajes.scrollHeight;
            
            while (chatMensajes.children.length > 50) {
                chatMensajes.removeChild(chatMensajes.firstChild);
            }
        }

        function enviarMensaje() {
            const texto = chatInput.value.trim();
            if (!texto) return;
            
            agregarMensajeChat(miNombre, texto, true);
            socket.emit('mensaje_chat', { nombre: miNombre, mensaje: texto });
            chatInput.value = '';
        }

        chatEnviar.addEventListener('click', enviarMensaje);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensaje();
        });

        socket.on('mensaje_chat', (data) => {
            agregarMensajeChat(data.nombre, data.mensaje, false);
        });

        socket.on('bienvenida_chat', (data) => {
            agregarMensajeChat('🟢 Sistema', `${data.nombre} se ha unido al metaverso`, false);
        });

        socket.on('despedida_chat', (data) => {
            agregarMensajeChat('🔴 Sistema', `${data.nombre} ha salido del metaverso`, false);
        });
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB);
        scene.fog = new THREE.Fog(0x87CEEB, 40, 70);

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 12, 18);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.body.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffeedd, 1.2);
        sun.position.set(30, 40, 20);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 80;
        sun.shadow.camera.left = -50;
        sun.shadow.camera.right = 50;
        sun.shadow.camera.top = 50;
        sun.shadow.camera.bottom = -50;
        scene.add(sun);

        const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
        fill.position.set(-20, 20, -20);
        scene.add(fill);

        
        
        const groundGeoPrincipal = new THREE.PlaneGeometry(100, 100, 60, 60);
        const groundMatPrincipal = new THREE.MeshStandardMaterial({ 
            color: 0x4a8c3f, 
            roughness: 0.8,
            metalness: 0.0
        });
        const ground = new THREE.Mesh(groundGeoPrincipal, groundMatPrincipal);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        scene.add(ground);

        const hillGeo = new THREE.PlaneGeometry(100, 100, 80, 80);
        const hillMat = new THREE.MeshStandardMaterial({
            color: 0x5a9c4f,
            roughness: 0.9,
            flatShading: true
        });
        const hills = new THREE.Mesh(hillGeo, hillMat);
        hills.rotation.x = -Math.PI / 2;
        hills.position.y = -0.4;
        hills.receiveShadow = true;
        
        const pos = hillGeo.attributes.position.array;
        for (let i = 0; i < pos.length; i += 3) {
            const x = pos[i];
            const z = pos[i+1];
            const dist = Math.sqrt(x*x + z*z);
            
            let altura = 0;
            altura += Math.sin(x * 0.08) * Math.cos(z * 0.1) * 1.5;
            altura += Math.sin(x * 0.15 + z * 0.12) * 0.8;
            altura += Math.sin(x * 0.25) * Math.cos(z * 0.2) * 0.4;
            altura += Math.exp(-dist * 0.03) * 1.2;
            
            const centro = Math.exp(-dist * 0.04);
            altura = altura * (1 - centro * 0.6);
            altura = Math.max(0, Math.min(altura, 3.5));
            pos[i+2] = altura;
        }
        hillGeo.computeVertexNormals();
        scene.add(hills);

        const lakeGeo = new THREE.CircleGeometry(8, 20);
        const lakeMat = new THREE.MeshStandardMaterial({
            color: 0x0088cc,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.5
        });
        const lake = new THREE.Mesh(lakeGeo, lakeMat);
        lake.rotation.x = -Math.PI / 2;
        lake.position.set(15, -0.3, 15);
        scene.add(lake);

        function crearArbolGrande(x, z) {
            const grupo = new THREE.Group();
            const tronco = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.35, 0.8, 6),
                new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.9 })
            );
            tronco.position.y = 0.4;
            tronco.castShadow = true;
            grupo.add(tronco);
            
            const copaMat = new THREE.MeshStandardMaterial({ color: 0x2d8a2d, roughness: 0.8 });
            const copa1 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6), copaMat);
            copa1.position.set(0, 1.0, 0);
            copa1.castShadow = true;
            grupo.add(copa1);
            
            const copa2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6), copaMat);
            copa2.position.set(0.5, 0.8, 0.3);
            copa2.castShadow = true;
            grupo.add(copa2);
            
            const copa3 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 6), copaMat);
            copa3.position.set(-0.4, 0.9, -0.3);
            copa3.castShadow = true;
            grupo.add(copa3);
            
            grupo.position.set(x, -0.5, z);
            scene.add(grupo);
        }

        function crearArbusto(x, z) {
            const grupo = new THREE.Group();
            const arbustoMat = new THREE.MeshStandardMaterial({ color: 0x3a7a3a, roughness: 0.9 });
            for (let i = 0; i < 3; i++) {
                const esfera = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 5),
                    arbustoMat
                );
                esfera.position.set((Math.random() - 0.5) * 0.3, 0.1 + Math.random() * 0.1, (Math.random() - 0.5) * 0.3);
                grupo.add(esfera);
            }
            grupo.position.set(x, -0.5, z);
            scene.add(grupo);
        }

        function crearRoca(x, z, escala = 1) {
            const rocaGeo = new THREE.DodecahedronGeometry(0.3 * escala);
            const rocaMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, metalness: 0.1 });
            const roca = new THREE.Mesh(rocaGeo, rocaMat);
            roca.position.set(x, -0.3 + 0.2 * escala, z);
            roca.rotation.set(Math.random() * 3, Math.random() * 3, 0);
            roca.scale.y = 0.6 + Math.random() * 0.4;
            roca.castShadow = true;
            roca.receiveShadow = true;
            scene.add(roca);
        }

        function crearFlor(x, z, color) {
            const grupo = new THREE.Group();
            const tallo = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.15, 4),
                new THREE.MeshStandardMaterial({ color: 0x228B22 })
            );
            tallo.position.y = 0.075;
            grupo.add(tallo);
            
            const flor = new THREE.Mesh(
                new THREE.SphereGeometry(0.06, 6),
                new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.1 })
            );
            flor.position.y = 0.18;
            grupo.add(flor);
            
            grupo.position.set(x, -0.5, z);
            scene.add(grupo);
        }

        const coloresFlores = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xff6bb5, 0xff9f43];

        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 85;
            const z = (Math.random() - 0.5) * 85;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 8 && !(Math.abs(x - 15) < 10 && Math.abs(z - 15) < 10)) {
                crearArbolGrande(x, z);
            }
        }

        for (let i = 0; i < 40; i++) {
            const x = (Math.random() - 0.5) * 80;
            const z = (Math.random() - 0.5) * 80;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 6 && dist < 35) {
                crearArbusto(x, z);
            }
        }

        for (let i = 0; i < 30; i++) {
            const x = (Math.random() - 0.5) * 75;
            const z = (Math.random() - 0.5) * 75;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 5 && !(Math.abs(x - 15) < 10 && Math.abs(z - 15) < 10)) {
                crearRoca(x, z, 0.5 + Math.random() * 0.8);
            }
        }

        for (let i = 0; i < 60; i++) {
            const x = (Math.random() - 0.5) * 70;
            const z = (Math.random() - 0.5) * 70;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 4 && dist < 30) {
                crearFlor(x, z, coloresFlores[Math.floor(Math.random() * coloresFlores.length)]);
            }
        }

        function crearCerca(x, z, rotacion = 0) {
            const grupo = new THREE.Group();
            const maderaMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.9 });
            for (let i = -2; i <= 2; i++) {
                const poste = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.07, 0.5, 4),
                    maderaMat
                );
                poste.position.set(i * 0.6, 0.25, 0);
                poste.castShadow = true;
                grupo.add(poste);
            }
            for (let y = 0; y < 2; y++) {
                const baranda = new THREE.Mesh(
                    new THREE.BoxGeometry(2.5, 0.04, 0.04),
                    maderaMat
                );
                baranda.position.set(0, 0.15 + y * 0.25, 0);
                grupo.add(baranda);
            }
            grupo.position.set(x, -0.5, z);
            grupo.rotation.y = rotacion;
            scene.add(grupo);
        }

        crearCerca(12, 22, 0.5);
        crearCerca(18, 22, -0.5);
        crearCerca(20, 18, 1.5);
        crearCerca(10, 18, -1.5);

        for (let i = 0; i < 20; i++) {
            const t = i / 20;
            const x = -8 + t * 30;
            const z = -8 + t * 30;
            const piedra = new THREE.Mesh(
                new THREE.CircleGeometry(0.15, 5),
                new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.9 })
            );
            piedra.rotation.x = -Math.PI / 2;
            piedra.position.set(x, -0.45, z);
            scene.add(piedra);
        }
               

        function crearMariposa(x, y, z) {
            const grupo = new THREE.Group();
            
            const cuerpo = new THREE.Mesh(
                new THREE.CylinderGeometry(0.02, 0.02, 0.08, 4),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            cuerpo.position.y = 0.04;
            grupo.add(cuerpo);
            
            const alaMat = new THREE.MeshStandardMaterial({ 
                color: Math.random() > 0.5 ? 0xff6b6b : 0x4d96ff,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            const alaGeo = new THREE.CircleGeometry(0.08, 4);
            
            const alaIzq = new THREE.Mesh(alaGeo, alaMat);
            alaIzq.rotation.x = -0.3;
            alaIzq.rotation.z = -0.5;
            alaIzq.position.set(-0.08, 0.04, 0);
            grupo.add(alaIzq);
            
            const alaDer = new THREE.Mesh(alaGeo, alaMat);
            alaDer.rotation.x = 0.3;
            alaDer.rotation.z = 0.5;
            alaDer.position.set(0.08, 0.04, 0);
            grupo.add(alaDer);
            
            const antenaMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
            for (let i = -1; i <= 1; i+=2) {
                const antena = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.005, 0.005, 0.05, 3),
                    antenaMat
                );
                antena.position.set(i * 0.03, 0.1, 0);
                antena.rotation.z = i * 0.3;
                grupo.add(antena);
            }
            
            grupo.userData = {
                velocidad: 0.3 + Math.random() * 0.3,
                radio: 1 + Math.random() * 2,
                angulo: Math.random() * Math.PI * 2,
                centroX: x,
                centroZ: z,
                altura: y,
                aleteo: 0
            };
            
            grupo.position.set(x, y, z);
            scene.add(grupo);
            return grupo;
        }

        function crearPajaro(x, y, z) {
            const grupo = new THREE.Group();
            
            const cuerpo = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6),
                new THREE.MeshStandardMaterial({ color: 0x222222 })
            );
            cuerpo.scale.set(1.5, 0.8, 1);
            grupo.add(cuerpo);
            
            const alaMat = new THREE.MeshStandardMaterial({ 
                color: 0x444444,
                side: THREE.DoubleSide
            });
            
            const alaGeo = new THREE.CircleGeometry(0.15, 4);
            
            const alaIzq = new THREE.Mesh(alaGeo, alaMat);
            alaIzq.rotation.x = -0.5;
            alaIzq.rotation.z = -0.3;
            alaIzq.position.set(-0.1, 0, 0);
            grupo.add(alaIzq);
            
            const alaDer = new THREE.Mesh(alaGeo, alaMat);
            alaDer.rotation.x = 0.5;
            alaDer.rotation.z = 0.3;
            alaDer.position.set(0.1, 0, 0);
            grupo.add(alaDer);
            
            const cola = new THREE.Mesh(
                new THREE.CircleGeometry(0.06, 4),
                new THREE.MeshStandardMaterial({ color: 0x444444, side: THREE.DoubleSide })
            );
            cola.rotation.x = 0.5;
            cola.position.set(0, 0, -0.12);
            grupo.add(cola);
            
            grupo.userData = {
                velocidad: 0.5 + Math.random() * 0.5,
                radio: 5 + Math.random() * 8,
                angulo: Math.random() * Math.PI * 2,
                centroX: x,
                centroZ: z,
                alturaBase: y,
                aleteo: 0
            };
            
            grupo.position.set(x, y, z);
            scene.add(grupo);
            return grupo;
        }

        function crearConejo(x, z) {
            const grupo = new THREE.Group();
            
            const cuerpo = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 6),
                new THREE.MeshStandardMaterial({ color: 0x8B8B7A })
            );
            cuerpo.scale.set(1.2, 0.8, 1);
            cuerpo.position.y = 0.1;
            grupo.add(cuerpo);
            
            const cabeza = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 6),
                new THREE.MeshStandardMaterial({ color: 0x9B9B8A })
            );
            cabeza.position.set(0.12, 0.15, 0);
            grupo.add(cabeza);
            
            const orejaMat = new THREE.MeshStandardMaterial({ color: 0x9B9B8A });
            for (let i = -1; i <= 1; i+=2) {
                const oreja = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.015, 0.02, 0.15, 4),
                    orejaMat
                );
                oreja.position.set(0.1 + i * 0.04, 0.25, 0);
                oreja.rotation.z = i * 0.2;
                grupo.add(oreja);
            }
            
            const pataMat = new THREE.MeshStandardMaterial({ color: 0x7B7B6A });
            for (let i = -1; i <= 1; i+=2) {
                const pata = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.03, 0.08, 4),
                    pataMat
                );
                pata.position.set(i * 0.06, 0.04, -0.08);
                grupo.add(pata);
            }
            
            const cola = new THREE.Mesh(
                new THREE.SphereGeometry(0.04, 5),
                new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
            );
            cola.position.set(0, 0.06, -0.14);
            grupo.add(cola);
            
            grupo.userData = {
                velocidad: 0.2 + Math.random() * 0.3,
                direccion: Math.random() * Math.PI * 2,
                tiempo: 0,
                estado: 'buscando', // 'buscando', 'saltando', 'comiendo'
                zonaX: x,
                zonaZ: z,
                radio: 2 + Math.random() * 3
            };
            
            grupo.position.set(x, -0.4, z);
            scene.add(grupo);
            return grupo;
        }

        const mariposas = [];
        const pajaros = [];
        const conejos = [];

        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 5) {
                const y = 0.5 + Math.random() * 0.5;
                mariposas.push(crearMariposa(x, y, z));
            }
        }

        for (let i = 0; i < 8; i++) {
            const x = (Math.random() - 0.5) * 70;
            const z = (Math.random() - 0.5) * 70;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 8) {
                const y = 4 + Math.random() * 4;
                pajaros.push(crearPajaro(x, y, z));
            }
        }

        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            const dist = Math.sqrt(x*x + z*z);
            if (dist > 6 && dist < 30) {
                conejos.push(crearConejo(x, z));
            }
        }

        function animarAnimales(time) {
            const tiempo = time / 1000;
            
            mariposas.forEach(mariposa => {
                const data = mariposa.userData;
                data.angulo += 0.01 * data.velocidad;
                
                mariposa.position.x = data.centroX + Math.cos(data.angulo) * data.radio;
                mariposa.position.z = data.centroZ + Math.sin(data.angulo) * data.radio;
                mariposa.position.y = data.altura + Math.sin(data.angulo * 2) * 0.2;
                
                mariposa.rotation.y = -data.angulo;
                
                data.aleteo += 0.1;
                const alas = mariposa.children.filter(c => c.geometry && c.geometry.type === 'CircleGeometry');
                alas.forEach((ala, i) => {
                    const factor = i === 0 ? 1 : -1;
                    ala.rotation.x = Math.sin(data.aleteo) * 0.5 * factor;
                });
            });
            
            pajaros.forEach(pajaro => {
                const data = pajaro.userData;
                data.angulo += 0.005 * data.velocidad;
                
                pajaro.position.x = data.centroX + Math.cos(data.angulo) * data.radio;
                pajaro.position.z = data.centroZ + Math.sin(data.angulo) * data.radio * 0.7;
                pajaro.position.y = data.alturaBase + Math.sin(data.angulo * 1.5) * 0.5;
                
                pajaro.rotation.y = -data.angulo + Math.PI / 2;
                
                data.aleteo += 0.15;
                const alas = pajaro.children.filter(c => c.geometry && c.geometry.type === 'CircleGeometry');
                alas.forEach((ala, i) => {
                    const factor = i === 0 ? 1 : -1;
                    ala.rotation.x = Math.sin(data.aleteo) * 0.8 * factor;
                });
            });
            
            conejos.forEach(conejo => {
                const data = conejo.userData;
                data.tiempo += 0.01;
                
                if (Math.random() < 0.005) {
                    data.direccion += (Math.random() - 0.5) * 2;
                }
                
                const dx = Math.cos(data.direccion) * data.velocidad * 0.02;
                const dz = Math.sin(data.direccion) * data.velocidad * 0.02;
                
                let newX = conejo.position.x + dx;
                let newZ = conejo.position.z + dz;
                
                const distDesdeCentro = Math.sqrt(
                    Math.pow(newX - data.zonaX, 2) + 
                    Math.pow(newZ - data.zonaZ, 2)
                );
                if (distDesdeCentro > data.radio) {
                    data.direccion += Math.PI / 2;
                }
                
                conejo.position.x = newX;
                conejo.position.z = newZ;
                
                conejo.rotation.y = -data.direccion;
                
                const salto = Math.abs(Math.sin(data.tiempo * 3)) * 0.08;
                conejo.position.y = -0.4 + salto;
                
                const estiramiento = 1 + Math.sin(data.tiempo * 3) * 0.05;
                conejo.scale.y = estiramiento;
                conejo.scale.x = 1 / estiramiento;
            });
        }
        function crearMiAvatar(emoji, nombre) {
            if (miPersonaje) scene.remove(miPersonaje);
            
            const grupo = new THREE.Group();
            
            const cuerpo = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.8, 0.6),
                new THREE.MeshStandardMaterial({ color: 0x00ccff, emissive: 0x004466 })
            );
            cuerpo.position.y = 0.4;
            grupo.add(cuerpo);

            const cabeza = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 6),
                new THREE.MeshStandardMaterial({ color: 0xffccaa })
            );
            cabeza.position.y = 0.9;
            grupo.add(cabeza);

            const canvas = document.createElement('canvas');
            canvas.width = 64; canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, 32, 32);
            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
            sprite.position.y = 1.5;
            sprite.scale.set(0.7, 0.7, 1);
            grupo.add(sprite);

            const nombreCanvas = document.createElement('canvas');
            nombreCanvas.width = 256;
            nombreCanvas.height = 64;
            const ctx2 = nombreCanvas.getContext('2d');
            ctx2.fillStyle = 'rgba(0,0,0,0.7)';
            ctx2.fillRect(10, 10, 236, 44);
            ctx2.font = 'bold 26px Arial';
            ctx2.textAlign = 'center';
            ctx2.textBaseline = 'middle';
            ctx2.fillStyle = '#ffffff';
            ctx2.fillText(nombre, 128, 36);
            
            const nombreTex = new THREE.CanvasTexture(nombreCanvas);
            const nombreSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nombreTex, depthTest: false, transparent: true }));
            nombreSprite.position.y = 2.1;
            nombreSprite.scale.set(1.6, 0.4, 1);
            grupo.add(nombreSprite);

            grupo.position.set(x, -0.5, z);
            scene.add(grupo);
            miPersonaje = grupo;
        }

        function crearAvatarOtro(id, emoji, nombre, xPos = 0, zPos = 0) {
            if (otrosAvatares[id]) {
                scene.remove(otrosAvatares[id]);
                delete otrosAvatares[id];
            }
            
            const grupo = new THREE.Group();
            
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            ctx.font = '80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji || '👾', 64, 64);
            const texture = new THREE.CanvasTexture(canvas);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }));
            sprite.scale.set(1.2, 1.2, 1);
            sprite.position.set(0, 0.6, 0);
            grupo.add(sprite);

            const cuerpo = new THREE.Mesh(
                new THREE.BoxGeometry(0.5, 0.4, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x4488ff, roughness: 0.5 })
            );
            cuerpo.position.y = 0.2;
            grupo.add(cuerpo);

            const nombreCanvas = document.createElement('canvas');
            nombreCanvas.width = 300;
            nombreCanvas.height = 70;
            const ctx2 = nombreCanvas.getContext('2d');
            ctx2.fillStyle = 'rgba(0,0,0,0.8)';
            ctx2.fillRect(10, 10, 280, 50);
            ctx2.font = 'bold 28px Arial';
            ctx2.textAlign = 'center';
            ctx2.textBaseline = 'middle';
            ctx2.fillStyle = '#ffffff';
            ctx2.fillText(nombre || 'Jugador', 155, 40);
            
            const nombreTex = new THREE.CanvasTexture(nombreCanvas);
            const nombreSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nombreTex, depthTest: false, transparent: true }));
            nombreSprite.position.y = 1.8;
            nombreSprite.scale.set(1.8, 0.42, 1);
            grupo.add(nombreSprite);

            grupo.position.set(xPos || 0, -0.5, zPos || 0);
            scene.add(grupo);
            otrosAvatares[id] = grupo;
            
            console.log(`✅ Avatar creado: ${nombre} con ${emoji}`);
        }

        const teclas = { w: false, a: false, s: false, d: false };
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'W') teclas.w = true;
            if (e.key === 'a' || e.key === 'A') teclas.a = true;
            if (e.key === 's' || e.key === 'S') teclas.s = true;
            if (e.key === 'd' || e.key === 'D') teclas.d = true;
        });
        document.addEventListener('keyup', (e) => {
            if (e.key === 'w' || e.key === 'W') teclas.w = false;
            if (e.key === 'a' || e.key === 'A') teclas.a = false;
            if (e.key === 's' || e.key === 'S') teclas.s = false;
            if (e.key === 'd' || e.key === 'D') teclas.d = false;
        });

        function setupBoton(id, tecla) {
            const btn = document.getElementById(id);
            if (!btn) return;
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); teclas[tecla] = true; });
            btn.addEventListener('touchend', (e) => { e.preventDefault(); teclas[tecla] = false; });
            btn.addEventListener('touchcancel', (e) => { teclas[tecla] = false; });
            btn.addEventListener('mousedown', () => teclas[tecla] = true);
            btn.addEventListener('mouseup', () => teclas[tecla] = false);
            btn.addEventListener('mouseleave', () => teclas[tecla] = false);
        }

        setupBoton('btn-arriba', 'w');
        setupBoton('btn-abajo', 's');
        setupBoton('btn-izquierda', 'a');
        setupBoton('btn-derecha', 'd');

        const velocidad = 0.12;
        let lastTime = 0;

                function loop(time) {
            const delta = Math.min((time - lastTime) / 16.67, 2);
            lastTime = time;
            
            animarAnimales(time);  
            
            let dx = 0, dz = 0;
            if (teclas.w) dz -= velocidad * delta;
            if (teclas.s) dz += velocidad * delta;
            if (teclas.a) dx -= velocidad * delta;
            if (teclas.d) dx += velocidad * delta;
            
            if (dx !== 0 && dz !== 0) {
                dx *= 0.707;
                dz *= 0.707;
            }
            
            x += dx;
            z += dz;

            const limite = 45;
            x = Math.max(-limite, Math.min(limite, x));
            z = Math.max(-limite, Math.min(limite, z));

            if (miPersonaje) {
                miPersonaje.position.x = x;
                miPersonaje.position.z = z;
                if (dx !== 0 || dz !== 0) {
                    miPersonaje.rotation.y = Math.atan2(dx, dz);
                }
                socket.emit('movimiento', { x: x, z: z });
            }

            camera.position.x += (x - camera.position.x) * 0.08;
            camera.position.z += (z + 12 - camera.position.z) * 0.08;
            camera.position.y += (8 - camera.position.y) * 0.08;
            camera.lookAt(x, 0, z);

            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        console.log('🚀 Metaverso iniciado');
        console.log('📱 Modo celular:', esCelular);
   