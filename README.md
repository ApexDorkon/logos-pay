
# Logos Pay Frontend

![Logos Pay](/LogosPayNamePNG.png)

**Logos Pay** is the first financial card powered by your reputation. By integrating with the **Ethos Network**, Logos Pay rewards users based on their "Ethos Score" (reputation score) with lower fees, higher spending limits, and instant crypto cashback.

This is the frontend application built with **Next.js**, **Tailwind CSS**, and **Privy** for authentication.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/logos-pay.git
    cd logos-pay
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and configure your keys (Privy App ID, Backend URL, etc.):
    ```env
    NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
    NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛠 Features & Integrations

### 1. Ethos API Integration (Reputation Score)

The core mechanism of Logos Pay is the **Ethos Score**. We fetch the user's reputation score to determine their **Tier**.
-   **Logic**: Located in `src/lib/getTier.ts` and `src/config/tiers.ts`.
-   **Tiers**: Users fall into tiers like *Untrusted*, *Neutral*, *Reputable*, or *Exemplary*.
-   **Benefits**: Higher tiers unlock:
    -   Reduced Processing Fees (e.g., down to 0%).
    -   Higher Cashback Rates (e.g., up to 10%).

### 2. StarPay API (Card Issuance)

We utilize the **StarPay API** (integrated via `src/lib/starpay.ts`) to handle the issuance of virtual prepaid Visa/Mastercards using Crypto.
-   **Functionality**:
    -   Create Orders (`amount`, `cardType`, `email`).
    -   Receive Payment Details (SOL address, Sol Amount).
    -   Track Order Status (`pending`, `completed`).
-   **Flow**: User selects amount -> StarPay generates a payment address -> User pays in Crypto -> Virtual Card is issued.

### 3. Authentication

-   **Privy**: Used for secure, web3-native authentication (`@privy-io/react-auth`). Users can sign in with their wallets or social accounts to link their Ethos profile.

---

## 📂 Project Structure

```bash
logos-pay/
├── public/              # Static assets (Logos, Videos)
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable UI components (Hero, Slider, Card)
│   ├── config/          # Configuration (Tier definitions)
│   ├── lib/             # Utility functions (API calls, Tier logic)
│   └── hooks/           # Custom React hooks
├── contracts/           # Smart Contracts (Cashback Vault)
└── README.md            # Project Documentation
```

## 🎨 UI & Design

The interface is designed to be **premium and trustworthy**:
-   **Typography**: Clean, bold sans-serif fonts.
-   **Color Palette**: Minimalist White/Black with **Gold** accents (`#C9A24D`) for branding.
-   **Animations**: Smooth fade-ins and interactive sliders to demonstrate the Ethos Score value proposition.

---

## 📜 License

[MIT](https://choosealicense.com/licenses/mit/)
