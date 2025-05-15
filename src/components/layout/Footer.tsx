export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
      © {new Date().getFullYear()} Mi Plataforma. Todos los derechos reservados.
    </footer>
  );
}
