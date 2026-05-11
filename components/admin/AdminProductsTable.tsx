"use client";

import Link from "next/link";
import { Product } from "@prisma/client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { formatPrice } from "@/lib/money";
import { formatProductWeight } from "@/lib/product-weight";
import { DragHandleIcon } from "@/components/ui/Icons";

const AUTO_SCROLL_EDGE_OFFSET = 140;
const AUTO_SCROLL_MAX_STEP = 10;

function truncateWithDots(text: string, maxLength = 58) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function reorderListByIds(currentItems: Product[], sourceId: string, targetId: string) {
  if (sourceId === targetId) return currentItems;

  const nextItems = [...currentItems];
  const sourceIndex = nextItems.findIndex((item) => item.id === sourceId);
  const targetIndex = nextItems.findIndex((item) => item.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) return currentItems;

  const [draggedItem] = nextItems.splice(sourceIndex, 1);
  nextItems.splice(targetIndex, 0, draggedItem);
  return nextItems;
}

export function AdminProductsTable({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const itemsRef = useRef(items);
  const dragPointerYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const touchDraggedIdRef = useRef<string | null>(null);
  const touchStartOrderRef = useRef<string[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!draggedId) {
      dragPointerYRef.current = null;
      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      return;
    }

    function updatePointerPosition(event: DragEvent) {
      dragPointerYRef.current = event.clientY;
    }

    function handleDragEnd() {
      setDraggedId(null);
    }

    function tickAutoScroll() {
      const pointerY = dragPointerYRef.current;

      if (pointerY !== null) {
        const viewportHeight = window.innerHeight;
        let scrollStep = 0;

        if (pointerY < AUTO_SCROLL_EDGE_OFFSET) {
          const intensity = (AUTO_SCROLL_EDGE_OFFSET - pointerY) / AUTO_SCROLL_EDGE_OFFSET;
          scrollStep = -Math.max(2, Math.round(AUTO_SCROLL_MAX_STEP * intensity));
        } else if (pointerY > viewportHeight - AUTO_SCROLL_EDGE_OFFSET) {
          const intensity = (pointerY - (viewportHeight - AUTO_SCROLL_EDGE_OFFSET)) / AUTO_SCROLL_EDGE_OFFSET;
          scrollStep = Math.max(2, Math.round(AUTO_SCROLL_MAX_STEP * intensity));
        }

        if (scrollStep !== 0) {
          window.scrollBy({ top: scrollStep, behavior: "auto" });
        }
      }

      autoScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll);
    }

    document.addEventListener("dragover", updatePointerPosition);
    document.addEventListener("dragend", handleDragEnd);
    autoScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll);

    return () => {
      document.removeEventListener("dragover", updatePointerPosition);
      document.removeEventListener("dragend", handleDragEnd);
      if (autoScrollFrameRef.current !== null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
    };
  }, [draggedId]);

  if (!items.length) {
    return (
      <div className="rounded-3xl bg-[#FFFFFF] p-8 text-center text-[#54342C]">
        Товаров пока нет
      </div>
    );
  }

  async function persistOrder(nextItems: Product[]) {
    setIsSavingOrder(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/products/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: nextItems.map((item) => item.id),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "product_reorder_failed");
      }

      setItems(result.products as Product[]);
      setMessage("Порядок обновлён");
    } catch (error) {
      console.error(error);
      setItems(products);
      setMessage("Не получилось сохранить порядок");
    } finally {
      setIsSavingOrder(false);
    }
  }

  function handleDrop(targetId: string) {
    if (!draggedId) return;
    const nextItems = reorderListByIds(items, draggedId, targetId);
    setDraggedId(null);

    if (nextItems === items) return;

    setItems(nextItems);
    void persistOrder(nextItems);
  }

  function handleMobilePointerDown(productId: string, event: ReactPointerEvent<HTMLDivElement>) {
    if (isSavingOrder) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPointerYRef.current = event.clientY;
    touchDraggedIdRef.current = productId;
    touchStartOrderRef.current = itemsRef.current.map((item) => item.id);
    setDraggedId(productId);
    setMessage(null);
  }

  function handleMobilePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const sourceId = touchDraggedIdRef.current;
    if (!sourceId) return;

    event.preventDefault();
    dragPointerYRef.current = event.clientY;

    const targetElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-mobile-product-id]");
    const targetId = targetElement?.dataset.mobileProductId;

    if (!targetId || targetId === sourceId) {
      return;
    }

    setItems((currentItems) => reorderListByIds(currentItems, sourceId, targetId));
  }

  function finishMobileDrag() {
    const sourceId = touchDraggedIdRef.current;
    if (!sourceId) return;

    const initialOrder = touchStartOrderRef.current;
    const nextItems = itemsRef.current;

    touchDraggedIdRef.current = null;
    touchStartOrderRef.current = [];
    dragPointerYRef.current = null;
    setDraggedId(null);

    const nextOrder = nextItems.map((item) => item.id);
    const hasOrderChanged =
      initialOrder.length === nextOrder.length &&
      initialOrder.some((itemId, index) => itemId !== nextOrder[index]);

    if (hasOrderChanged) {
      void persistOrder(nextItems);
    }
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] shadow-lg ring-1 ring-black/5">
      {message ? (
        <div className="border-b border-[#E6AECB] px-4 py-3 text-sm font-semibold text-[#54342C]">
          {message}
        </div>
      ) : null}
      <div className="grid gap-4 p-4 lg:hidden">
        {items.map((product) => (
          <article
            key={product.id}
            data-mobile-product-id={product.id}
            draggable={!isSavingOrder}
            onDragStart={() => {
              setDraggedId(product.id);
              setMessage(null);
            }}
            onDragEnd={() => setDraggedId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(product.id)}
            className={`rounded-2xl bg-[#FFF9FB] p-3 ring-1 ring-[#E6AECB] ${
              draggedId === product.id ? "opacity-70" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#FFF4F8]">
                <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#54342C]">{product.title}</p>
              </div>
              <div
                onPointerDown={(event) => handleMobilePointerDown(product.id, event)}
                onPointerMove={handleMobilePointerMove}
                onPointerUp={finishMobileDrag}
                onPointerCancel={finishMobileDrag}
                className="inline-flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-2xl bg-white text-[#8A6A62] ring-1 ring-[#E6AECB]"
              >
                <DragHandleIcon size={16} />
              </div>
            </div>

            <Link
              href={`/admin/products/${product.id}`}
              className="mt-3 inline-flex w-full justify-center rounded-full bg-[#54342C] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Редактировать
            </Link>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#E6AECB] text-center text-sm text-[#54342C]">
              <th className="w-16 px-3 py-4"></th>
              <th className="px-5 py-4">Товар</th>
              <th className="px-5 py-4">Цена</th>
              <th className="px-5 py-4">Вес</th>
              <th className="px-5 py-4">Наличие</th>
              <th className="px-5 py-4">Опубликовано</th>
              <th className="px-5 py-4">Действие</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr
                key={product.id}
                draggable={!isSavingOrder}
                onDragStart={() => {
                  setDraggedId(product.id);
                  setMessage(null);
                }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(product.id)}
                className={`border-b border-[#E6AECB] text-center last:border-b-0 ${
                  draggedId === product.id ? "opacity-70" : ""
                }`}
              >
                <td className="px-3 py-4">
                  <div className="inline-flex h-11 w-11 cursor-grab items-center justify-center rounded-2xl bg-[#FFF4F8] text-[#8A6A62] ring-1 ring-[#E6AECB] active:cursor-grabbing">
                    <DragHandleIcon size={18} />
                  </div>
                </td>
                <td className="px-5 py-4 text-left">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#FFF4F8]">
                      <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#54342C]">{product.title}</p>
                      <p className="mt-1 max-w-xs overflow-hidden whitespace-nowrap text-sm text-[#54342C]">
                        {truncateWithDots(product.shortDescription)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-[#54342C]">{formatPrice(product.price)}</td>
                <td className="px-5 py-4 text-sm text-[#54342C]">{formatProductWeight(product.weight)}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-[#FFF4F8] px-3 py-1 text-xs font-semibold text-[#54342C]">
                    {product.isAvailable ? "В наличии" : "Нет"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex rounded-full bg-[#FFF4F8] px-3 py-1 text-xs font-semibold text-[#54342C]">
                    {product.isPublished ? "Да" : "Нет"}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="inline-flex rounded-full bg-[#54342C] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Редактировать
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
