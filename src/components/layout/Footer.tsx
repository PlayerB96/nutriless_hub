export default function Footer() {
  return (
    <footer className="bg-muted dark:bg-muted p-4 text-center text-sm text-text-secondary dark:text-text-secondary">
      © {new Date().getFullYear()} NutriHub. Todos los derechos reservados.
    </footer>
  );
}
