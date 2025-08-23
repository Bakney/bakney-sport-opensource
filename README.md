# Bakney Sport - Open Source 🏃‍♂️

<div align="center">
  <img src="ui/public/oem/opensource/brand/logo.svg" alt="Bakney Sport Logo" width="200"/>
  
  **Il gestionale completo per società sportive dilettantistiche**
  
  [![License: AGPL3.0](https://img.shields.io/badge/License-AGPL3.0-green.svg)](https://opensource.org/licenses/agpl-v3)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Svelte](https://img.shields.io/badge/Svelte-4.2-orange.svg)](https://svelte.dev/)
</div>

<div style="background-color: green; border-radius: 1.5rem; padding: 16px; margin: 16px 0;">
  <h3 style="color: white; margin-top: 0;">
    🚨 <strong>Stato del Progetto e Contributi</strong>
  </h3>
  
  <p style="color: white; margin-bottom: 12px;">
    La versione rilasciata come open source è la v0, quella attualmente in produzione a meno della business logic utilizzata nella versione cloud hostata da noi. Stiamo lavorando a una migrazione completa che includerà una riscrittura del codice in Svelte e shadcn/ui per la UI e miglioramenti notevoli per il backend in django, che rilasceremo nei prossimi mesi.
  </p>
  
  <ul style="color: white; margin-bottom: 12px;">
    <li><strong>⚙️ Backend</strong>: sarà rilasciato nelle prossime settimane nella cartella <code>be/</code></li>
    <li><strong>💬 Supporto sviluppo</strong>: per configurazione locale e dubbi, contattateci su <a href="https://t.me/+Cxbg24Az1S0wMjI0" style="color:green;font-weight:800;background:white;border-radius:1rem;padding:0.2rem 0.4rem;margin:0.2rem;">Telegram</a></li>
    <li><strong>📚 Documentazione</strong>: attualmente essenziale, sarà ampliata presto</li>
  </ul>
  
  <p style="color: white; margin-bottom: 0;">
    <strong>Apprezziamo molto il vostro feedback e contributi! 🙏✨</strong>
  </p>
</div>


## 🎯 Cos'è Bakney Sport

Bakney Sport è un gestionale completo e innovativo progettato specificamente per le **Associazioni Sportive Dilettantistiche (ASD)**. Nato dall'esperienza di [Bakney.com](https://bakney.com), questo progetto diventa ora **open source** per permettere a tutte le società sportive di beneficiare di uno strumento professionale per la gestione digitale delle loro attività.
<div align="center">
<a style="font-size:1.2rem;font-weight:bold;" href="https://t.me/+Cxbg24Az1S0wMjI0">Entra nella Community su Telegram</a>
</div>
<div align="center">
  <img src="./docs/img/telegram.png" alt="Telegram Community" width="100"/>
</div>


### 🚀 Funzionalità Principali

#### 📋 **Gestione Associati e Tesserati**
- Anagrafica completa di soci e atleti
- Gestione documenti e certificati medici
- Firma digitale dei moduli
- Importazione massiva da Excel
- Tessere digitali personalizzabili
- Gestione minori e tutori legali

#### 🏫 **Gestione Corsi e Attività**
- Calendario corsi e lezioni
- Rilevazione presenze digitale
- Gestione istruttori e collaboratori
- Pianificazione camps e ritiri sportivi
- Carnet e pacchetti lezioni
- Liste d'attesa automatiche

#### 💰 **Contabilità e Pagamenti**
- Emissione automatica ricevute
- Integrazione con Stripe per pagamenti online
- Gestione quote associative
- Scadenzario pagamenti
- Report economici e bilanci
- Fatturazione elettronica
- Prima nota contabile

#### 📱 **Iscrizioni Online**
- Moduli di iscrizione personalizzabili
- Form builder drag & drop
- Raccolta documenti digitale
- Pagamenti online integrati
- Gestione iscrizioni multiple (famiglie)
- QR code per accesso rapido (disponibile nella v1)

#### 📊 **Comunicazione e Marketing**
- Invio SMS ed email massive
- Newsletter automatizzate
- Automazioni marketing
- Gestione eventi e tornei
- Condivisione calendari pubblici

#### 📈 **Report e Statistiche**
- Dashboard interattiva con widgets
- Report presenze e frequenze
- Analisi economiche
- Esportazione dati in Excel
- Grafici e KPI personalizzabili

#### 🔐 **Sicurezza e Conformità**
- Autenticazione a due fattori
- Gestione permessi granulare
- Backup automatici
- GDPR compliant
- Audit log delle operazioni

## 🛠️ Architettura Tecnica

### Frontend
- **Framework**: Svelte 4.2
- **Build Tool**: Vite 5
- **Routing**: svelte-spa-router
- **UI Components**: Custom components
- **Grafici**: ApexCharts
- **Calendario**: FullCalendar
- **Pagamenti**: Stripe Integration

### Struttura del Progetto

```
bakney-sport-oss/
├── ui/                         # Applicazione frontend
│   ├── src/
│   │   ├── components/        # Componenti riutilizzabili
│   │   ├── routes/           # Pagine dell'applicazione
│   │   ├── store/            # State management
│   │   ├── utils/            # Utility functions
│   │   └── layouts/          # Layout templates
│   ├── public/               # Assets statici
│   └── package.json          # Dipendenze frontend
└── README.md
```

## 📦 Installazione e Setup

### Prerequisiti

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- Un backend API compatibile (da configurare)

### Installazione

1. **Clona il repository**
   ```bash
   git clone https://github.com/yourusername/bakney-sport-oss.git
   cd bakney-sport-oss
   ```

2. **Naviga nella directory UI**
   ```bash
   cd ui
   ```

3. **Installa le dipendenze**
   ```bash
   npm install
   ```

4. **Configura gli endpoint API**
   
   Modifica il file `ui/endpoints.js` per configurare gli endpoint del tuo backend.

5. **Avvia l'ambiente di sviluppo**
   ```bash
   npm run dev
   ```
   
   L'applicazione sarà disponibile su `https://localhost:5001`

### Build di Produzione

```bash
npm run build:vite:production
```

I file compilati saranno disponibili nella cartella `dist/`.

## 🔧 Configurazione

### Variabili d'Ambiente

Crea un file `.env` nella cartella `ui/` con le seguenti variabili:

```env
VITE_API_URL=https://your-api-backend.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_ENVIRONMENT=development
```

### Personalizzazione OEM

Il sistema supporta la personalizzazione completa del branding attraverso la directory `public/oem/`. 

Struttura:
```
public/oem/[nome-brand]/
├── brand/
│   ├── logo.svg
│   └── favicon.ico
└── manifest.json
```

Il file `manifest.json` contiene le configurazioni del brand:
```json
{
  "name": "Nome Associazione",
  "colors": {
    "primary": "#007bff",
    "secondary": "#6c757d"
  },
  "features": {
    "payments": true,
    "invoicing": true,
    "camps": true
  }
}
```

## 🚀 Deploy

Per deployare la UI è sufficiente caricare i file della build dietro ad un qualsiasi reverse-proxy come: caddy, ngnix, apache etc.

### Hosting Tradizionale

1. Esegui il build di produzione
2. Carica i contenuti della cartella `dist/` sul tuo server web
3. Configura il web server per servire l'applicazione SPA

## 🤝 Contribuire

Siamo entusiasti di accogliere contributi dalla community! 

### Come Contribuire

1. Fork il progetto
2. Crea un feature branch (`git checkout -b feature/funzionalita-super-utile`)
3. Commit delle modifiche (`git commit -m 'add: funzionalita-super-utile'`)
4. Push al branch (`git push origin feature/funzionalita-super-utile`)
5. Apri una Pull Request

### Linee Guida

- Segui lo stile di codice esistente
- Aggiungi test per le nuove funzionalità
- Aggiorna la documentazione se necessario
- Assicurati che tutti i test passino prima di aprire una PR

## 📄 Licenza

Questo progetto è rilasciato sotto licenza AGPL 3.0. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 🆘 Supporto

- **Documentazione**: [In preparazione]
- **Issues**: [GitHub Issues](https://github.com/Bakney/bakney-sport-oss/issues)
- **Discussioni**: [GitHub Discussions](https://github.com/Bakney/bakney-sport-oss/discussions)
- **Email**: support@bakney.com

## 🙏 Ringraziamenti

Un ringraziamento speciale a tutti i contributori e alle società sportive che hanno reso possibile questo progetto.

---

<div align="center">
  Made with ❤️ by the Bakney Team
  
  [Website](https://bakney.com) • [Documentation](https://manuale.bakney.com) • [Community su Telegram](https://t.me/+Cxbg24Az1S0wMjI0)
</div>