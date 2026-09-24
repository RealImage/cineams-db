
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// Qube Design System colour ramps (prefab-ui tokens). Stock Tailwind
				// palettes the app uses are pointed at the matching DS ramp.
				grey: { '10': '#f7f8f9', '50': '#f0f2f4', '100': '#e1e4e9', '200': '#c2cad3', '300': '#a4afbc', '400': '#8595a6', '500': '#677a90', '600': '#526273', '700': '#3e4956', '800': '#29313a', '900': '#15181d', '950': '#15181d' },
				red: { '10': '#fdf3f4', '50': '#fae7e9', '100': '#f5d0d3', '200': '#eca1a7', '300': '#e2717a', '400': '#d9424e', '500': '#cf1322', '600': '#a60f1b', '700': '#7c0b14', '800': '#53080e', '900': '#290407', '950': '#290407' },
				orange: { '10': '#fef7f2', '50': '#fcefe5', '100': '#fadecc', '200': '#f5be99', '300': '#f09d66', '400': '#eb7d33', '500': '#e65c00', '600': '#b84a00', '700': '#8a3700', '800': '#5c2500', '900': '#2e1200', '950': '#2e1200' },
				yellow: { '10': '#fefaf2', '50': '#fdf6e6', '100': '#fceccd', '200': '#f9da9a', '300': '#f6c768', '400': '#f3b535', '500': '#f0a203', '600': '#d89203', '700': '#a87102', '800': '#785102', '900': '#483101', '950': '#483101' },
				green: { '10': '#f3f8f5', '50': '#e7f2ea', '100': '#cfe5d5', '200': '#9ecbab', '300': '#6eb081', '400': '#3d9657', '500': '#0d7c2d', '600': '#0a6324', '700': '#084a1b', '800': '#053212', '900': '#031909', '950': '#031909' },
				blue: { '10': '#f2fafe', '50': '#e6f4fe', '100': '#cdeafd', '200': '#9ad4fb', '300': '#68bff8', '400': '#35a9f6', '500': '#0394f4', '600': '#0276c3', '700': '#025992', '800': '#013b62', '900': '#011e31', '950': '#011e31' },
				purple: { '10': '#f7f5fb', '50': '#f0ebf8', '100': '#e1d8f1', '200': '#c2b0e2', '300': '#a489d4', '400': '#8561c5', '500': '#673ab7', '600': '#522e92', '700': '#3e236e', '800': '#291749', '900': '#150c25', '950': '#150c25' },
				gray: { '10': '#f7f8f9', '50': '#f0f2f4', '100': '#e1e4e9', '200': '#c2cad3', '300': '#a4afbc', '400': '#8595a6', '500': '#677a90', '600': '#526273', '700': '#3e4956', '800': '#29313a', '900': '#15181d', '950': '#15181d' },
				slate: { '10': '#f7f8f9', '50': '#f0f2f4', '100': '#e1e4e9', '200': '#c2cad3', '300': '#a4afbc', '400': '#8595a6', '500': '#677a90', '600': '#526273', '700': '#3e4956', '800': '#29313a', '900': '#15181d', '950': '#15181d' },
				amber: { '10': '#fefaf2', '50': '#fdf6e6', '100': '#fceccd', '200': '#f9da9a', '300': '#f6c768', '400': '#f3b535', '500': '#f0a203', '600': '#d89203', '700': '#a87102', '800': '#785102', '900': '#483101', '950': '#483101' },
				emerald: { '10': '#f3f8f5', '50': '#e7f2ea', '100': '#cfe5d5', '200': '#9ecbab', '300': '#6eb081', '400': '#3d9657', '500': '#0d7c2d', '600': '#0a6324', '700': '#084a1b', '800': '#053212', '900': '#031909', '950': '#031909' },
				wire: { '10': '#ebf5ff', '50': '#d0e7fc', '100': '#a2cff9', '200': '#73b7f6', '300': '#2179cc', '400': '#084782', '500': '#073c6f', '600': '#06335e', '700': '#052c50', '800': '#042544' },
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			fontFamily: {
				sans: ['Commissioner', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
			},
			borderRadius: {
				// DS radii: 2 / 4 / 6 / 8px
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xs: '2px'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' }
				},
				'slide-out-right': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(100%)' }
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.2s ease-in',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-out-right': 'slide-out-right 0.2s ease-in',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-in'
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(10px)'
			},
			boxShadow: {
				// Navy-tinted DS elevations; stock names mapped onto them
				'sm': 'var(--elevation-100)',
				'DEFAULT': 'var(--elevation-100)',
				'md': 'var(--elevation-200)',
				'lg': 'var(--elevation-300)',
				'xl': 'var(--elevation-overlay)',
				'sheet': 'var(--elevation-sheet)',
				'glass': 'var(--elevation-200)',
				'glass-lg': 'var(--elevation-300)'
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'filter': 'filter',
				'backdrop-filter': 'backdrop-filter'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
