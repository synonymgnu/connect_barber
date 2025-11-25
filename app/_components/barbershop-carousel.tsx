"use client";

import { useRef, useState, useEffect } from "react";
import { Barbershop } from "../generated/prisma";
import BarbershopItem from "./barbershop-item";
import ButtonIcon from "./button-icon";

interface Props {
  title: string;
  barbershops: Barbershop[];
}

export default function BarbershopCarousel({ title, barbershops }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      const c = containerRef.current;
      if (!c) return;

      const { scrollLeft, scrollWidth, clientWidth } = c;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
    }

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // executa uma vez para definir o estado inicial

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeftFn = () => {
    const c = containerRef.current;
    if (c) c.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRightFn = () => {
    const c = containerRef.current;
    if (c) c.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
        {title}
      </h2>

      <div className="relative">
        {showLeft && (
          <ButtonIcon
            direction="left"
            onClick={scrollLeftFn}
            className="left-0"
          />
        )}

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
        >
          {barbershops.map((barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={{ ...barbershop, averageRating: 0 }} />
          ))}
        </div>

        {showRight && (
          <ButtonIcon
            direction="right"
            onClick={scrollRightFn}
            className="right-0"
          />
        )}
      </div>
    </div>
  );
}
