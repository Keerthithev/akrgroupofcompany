import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
		"./lib/**/*.{js,ts,jsx,tsx}",
		"./hooks/**/*.{js,ts,jsx,tsx}",
		"./App.tsx",
		"./main.tsx",
	],
	safelist: [
		'from-blue-500',
		'to-blue-700',
		'from-green-500',
		'to-green-700',
		'from-orange-500',
		'to-orange-700',
		'from-red-500',
		'to-red-700',
		'from-purple-500',
		'to-purple-700',
		'from-green-600',
		'to-green-800',
		'from-pink-500',
		'to-pink-700',
		'from-indigo-500',
		'to-indigo-700',
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
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					dark: 'hsl(var(--primary-dark))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					glow: 'hsl(var(--accent-glow))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					glow: 'hsl(var(--card-glow))'
				},
				'akr-green-1': '#11998e',
				'akr-green-2': '#38ef7d',
			},
			backgroundImage: {
				'gradient-cosmic': 'var(--gradient-cosmic)',
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-glass': 'var(--gradient-glass)',
				'akr-green-gradient': 'linear-gradient(90deg, #11998e 0%, #38ef7d 100%)',
			},
			boxShadow: {
				'cosmic': 'var(--shadow-cosmic)',
				'glow': 'var(--shadow-glow)',
				'card': 'var(--shadow-card)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
