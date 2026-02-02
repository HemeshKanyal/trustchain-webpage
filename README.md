# TRUSTCHAIN  
### Trust. Secured.

TrustChain is a futuristic, immersive web platform designed to address the global crisis of counterfeit medicines. By visualizing the impact and the solution through high-fidelity 3D graphics and interactive storytelling, we aim to restore trust in the pharmaceutical supply chain.

## 🌟 Overview

This project is a high-performance **Next.js** application featuring extensive 3D elements powered by **React Three Fiber (R3F)** and **Three.js**. It creates a cinematic user experience with:

- **Interactive 3D Globe**: Visualizing global hotspots of counterfeit activity.
- **Particle Systems**: Dynamic backgrounds reacting to user interaction.
- **Scroll-Driven Animations**: Seamless transitions powered by `framer-motion`.
- **Modern UI**: Glassmorphism, tailored typography, and a "dark future" aesthetic.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) & [Three.js](https://threejs.org/)
- **3D Helpers**: [@react-three/drei](https://github.com/pmndrs/drei)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Spline**: Integrated 3D scenes via `@splinetool/react-spline`

## 🚀 Getting Started

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/trustchain-frontend.git
    cd trustchain-frontend/trustchain-webpage
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open locally:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```bash
├── app/                  # Next.js App Router pages
│   ├── page.js           # Main Entry Point (Landing Page)
│   ├── layout.js         # Root Layout
│   └── globals.css       # Global Styles & Tailwind Directives
├── components/           # Reusable UI & 3D Components
│   ├── HeroScene.js      # 3D Globe & Particles
│   ├── Navbar.js         # Responsive Navigation
│   ├── SolutionScene.js  # 3D Visualization of the solution
│   └── ...               # Other scenes (Pyramid, Workflow, IoT, etc.)
├── public/               # Static assets (textures, models, images)
└── ...
```

## ✨ Key Features

- **Hero Scene**: A dense particle background with a responsive mouse interaction and a rotating globe highlighting critical regions.
- **Dynamic Navbar**: Auto-hiding on scroll for an immersive viewing experience.
- **Performance Optimized**: Uses `useFrame` and `useScroll` for smooth 60fps animations.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

---

> "10–30% of medicines worldwide are fake. Trust is broken. Lives are lost." — **TrustChain Mission**
