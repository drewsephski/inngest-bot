'use client';

import React, { useState } from 'react';

interface BubbleTextProps {
	text: string;
	className?: string;
}

export const BubbleText = ({ text, className = '' }: BubbleTextProps) => {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	return (
		<span onMouseLeave={() => setHoveredIndex(null)} className={`inline-block ${className}`}>
			{text.split('').map((char, idx) => {
				const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;

				let classes = 'transition-all duration-300 ease-out cursor-default inline-block';

				switch (distance) {
					case 0:
						// Hovered character - subtle emphasis
						classes += ' font-bold scale-110 text-primary';
						break;
					case 1:
						// Immediate neighbors - light effect
						classes += ' font-medium scale-105 text-primary/60';
						break;
					case 2:
						// Second neighbors - very subtle
						classes += ' font-normal scale-100 text-foreground/80';
						break;
					default:
						// Far away - slight dim
						if (hoveredIndex !== null) {
							classes += ' text-foreground/60';
						}
						break;
				}

				return (
					<span key={idx} onMouseEnter={() => setHoveredIndex(idx)} className={classes}>
						{char === ' ' ? '\u00A0' : char}
					</span>
				);
			})}
		</span>
	);
};
