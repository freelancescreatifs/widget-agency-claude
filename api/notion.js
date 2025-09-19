<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' fill='%23E4405F'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#E4405F" />
    <meta name="description" content="Widget Instagram pour Notion - Planifiez vos posts Instagram directement dans Notion avec gestion multi-comptes" />
    <meta name="keywords" content="Instagram, Notion, Planning, Social Media, Widget, Multi-comptes" />
    <meta name="author" content="Freelance Créatif" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Widget Instagram pour Notion" />
    <meta property="og:description" content="Planifiez vos posts Instagram directement dans Notion avec gestion multi-comptes" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://picsum.photos/1200/630?random=widget" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Widget Instagram pour Notion" />
    <meta name="twitter:description" content="Planifiez vos posts Instagram directement dans Notion" />
    
    <title>Widget Instagram pour Notion - Multi-comptes</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom CSS for animations -->
    <style>
      @keyframes slideProgress {
        from { transform: translateX(-100%); }
        to { transform: translateX(0%); }
      }
      
      .slide-progress {
        animation: slideProgress 3s linear infinite;
      }
      
      /* Instagram-like scrollbar */
      ::-webkit-scrollbar {
        height: 4px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 2px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
    </style>
  </head>
  <body>
    <noscript>Vous devez activer JavaScript pour utiliser ce widget Instagram.</noscript>
    <div id="root"></div>
    
    <!-- Powered by Freelance Créatif -->
    <div style="display: none;">
      Created by Freelance Créatif - Instagram Widget for Notion
    </div>
  </body>
</html>
