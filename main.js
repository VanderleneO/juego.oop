class Game {
  constructor() {
    this.container = document.getElementById("game-container");

    // Personajes//
    this.personaje1 = new Personaje("niño-futbol.png", 60, 190);  // Controlado
    this.personaje2 = new Personaje("arbitro1.png", 850, 290); // Fijo

    // Agregar los personajes al contenedor
    this.container.appendChild(this.personaje1.element);
    this.container.appendChild(this.personaje2.element);

    // Crear "monedas=pelotas"
    this.monedas = [];
    this.puntuacion = 0;
    this.tiempo = 20;
    this.puntosElement = document.getElementById("puntos");
    for (let i = 0; i < 6; i++) {
      const moneda = new Moneda();
      this.monedas.push(moneda);
      this.container.appendChild(moneda.element);
    }

    this.agregarEventos();
    //temporizador 
    this.iniciarTemporizador();

    // Música: solo la primera vez que se presiona una tecla
    window.addEventListener("keydown", () => {
      const audio = document.getElementById("musica-fondo");
      if (audio && audio.paused) {
        audio.currentTime = 17; // Empieza desde el segundo 17
        audio.play();

        // Guardar el timeout para poder cancelarlo si termina antes
        this.musicaTimeout = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, this.tiempo * 1000);
      }
    }, { once: true });
  }

  agregarEventos() {
    window.addEventListener("keydown", (e) => {
      if (["ArrowRight", "ArrowLeft", "ArrowUp"].includes(e.key)) {
        this.personaje1.mover(e);
      }
    });

    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.monedas.forEach((moneda, index) => {
        if (this.personaje1.colisionaCon(moneda)) {
          this.container.removeChild(moneda.element);
          this.monedas.splice(index, 1);
          this.actualizarPuntuacion(1);

          // 🔊 Reproducir sonido de gol
          const sonidoGol = document.getElementById("sonido-gol");
          if (sonidoGol) {
            sonidoGol.currentTime = 0;
            sonidoGol.play();
          }
        }
      });
    }, 100);
  }



  actualizarPuntuacion(puntos) {
    this.puntuacion += puntos;
    this.puntosElement.textContent = `Trofeo: ${this.puntuacion}`;
  }

  iniciarTemporizador() {
    const tiempoElemento = document.getElementById("tiempo");

    this.intervaloTiempo = setInterval(() => {
      this.tiempo--;
      tiempoElemento.textContent = `Tiempo: ${this.tiempo}`;

      if (this.tiempo <= 0) {
        clearInterval(this.intervaloTiempo);

        // Detener música y limpiar timeout si el tiempo termina antes que el setTimeout
        const audio = document.getElementById("musica-fondo");
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
        if (this.musicaTimeout) {
          clearTimeout(this.musicaTimeout);
        }

        alert(`¡Tiempo terminado! Puntaje final: ${this.puntuacion}`);
        location.reload();
      }
    }, 1000);
  }
}

class Personaje {
  constructor(imgSrc, xInicial, yInicial) {
    this.x = xInicial;
    this.y = yInicial;
    this.width = 70;
    this.height = 80;
    this.velocidad = 10;
    this.saltando = false;

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.position = "absolute";

    const personajeSprite = document.createElement("img");
    personajeSprite.src = imgSrc;
    personajeSprite.style.width = "100%";
    personajeSprite.style.height = "100%";
    personajeSprite.style.objectFit = "contain";
    personajeSprite.style.objectPosition = "bottom";

    this.element.appendChild(personajeSprite);
    this.actualizarPosicion();
  }

  mover(evento) {
    if (evento.key === "ArrowRight") {
      this.x += this.velocidad;
      if (this.x > 940) this.x = 90; // límite derecha
    } else if (evento.key === "ArrowLeft") {
      this.x -= this.velocidad;
      if (this.x < 0) this.x = 0; // límite izquierda
    } else if (evento.key === "ArrowUp" && !this.saltando) {
      this.saltar();
    }
    this.actualizarPosicion();
  }

  saltar() {
    this.saltando = true;
    const alturaMaxima = this.y - 200;

    const salto = setInterval(() => {
      if (this.y > alturaMaxima) {
        this.y -= 8;
      } else {
        clearInterval(salto);
        this.caer();
      }
      this.actualizarPosicion();
    }, 20);
  }

  caer() {
    const gravedad = setInterval(() => {
      if (this.y < 180) {
        this.y += 8;
      } else {
        clearInterval(gravedad);
        this.saltando = false;
      }
      this.actualizarPosicion();
    }, 20);
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }



  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}

class Moneda {
  constructor() {
    this.x = Math.random() * 300 + 350;
    this.y = Math.random() * 200 + 10;
    this.width = 40;
    this.height = 40;

    this.element = document.createElement("div");
    this.element.classList.add("moneda");
    this.element.style.position = "absolute";
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    const monedaImg = document.createElement("img");
    monedaImg.src = "pelota.png";
    monedaImg.style.width = "100%";
    monedaImg.style.height = "100%";
    monedaImg.style.objectFit = "contain";

    this.element.appendChild(monedaImg);
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// Inicializar juego
const juego = new Game();
