/**
 * Utilitário para mapear ícones de categorias
 * Converte nomes de ícones salvos no banco para componentes React
 */
import {
  Cpu,
  Mouse,
  Smartphone,
  Gamepad2,
  Monitor,
  Laptop,
  Package,
  type LucideIcon,
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Cpu,
  Mouse,
  Smartphone,
  Gamepad2,
  Monitor,
  Laptop,
  Package,
};

/**
 * Obtém o componente de ícone baseado no nome
 * @param iconName - Nome do ícone (ex: "Cpu", "Mouse")
 * @returns Componente React do ícone ou Package como fallback
 */
export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Package;
}

