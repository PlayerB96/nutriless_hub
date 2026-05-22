export default function Footer() {
  return (
    <footer className="bg-muted dark:bg-muted p-3 tablet:p-4 text-center text-xs tablet:text-sm text-text-secondary dark:text-text-secondary">
      © {new Date().getFullYear()} NutriHub v0.1.2 Todos los derechos
      reservados.
    </footer>
  );
}
