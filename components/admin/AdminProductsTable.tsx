"use client";

import Link from "next/link";
import { Product } from "@prisma/client";
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { formatPrice } from "@/lib/money";
import { formatProductWeight } from "@/lib/product-weight";
import { DragHandleIcon } from "@/components/ui/Icons";

const AUTO_SCROLL_EDGE_OFFSET = 120;
const AUTO_SCROLL_MAX_STEP = 16;
const REORDER_ANIMATION_DURATION = 180;

type DragPreview = {
  productId: string;
  pointerX: number;
  pointerY: number;
  width: number;
  layout: "mobile" | "desktop";
};

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

function orderItemsByIds(currentItems: Product[], orderedIds: string[]) {
  const itemsById = new Map(currentItems.map((item) => [item.id, item]));
  return orderedIds.flatMap((itemId) => {
    const item = itemsById.get(itemId);
    return item ? [item] : [];
  });
}

export function AdminProductsTable({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const itemsRef = useRef(items);
  const dragPointerYRef = useRef<number | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const touchDraggedIdRef = useRef<string | null>(null);
  const touchStartOrderRef = useRef<string[]>([]);
  const dragLayoutRef = useRef<DragPreview["layout"] | null>(null);

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

    autoScrollFrameRef.current = window.requestAnimationFrame(tickAutoScroll);

    return () => {
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

  async function persistOrder(nextItems: Product[], previousItems: Product[]) {
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
      itemsRef.current = previousItems;
      setItems(previousItems);
      setMessage("Не получилось сохранить порядок");
    } finally {
      setIsSavingOrder(false);
    }
  }

  function getVisibleItemPositions(layout: DragPreview["layout"]) {
    return new Map(
      Array.from(document.querySelectorAll<HTMLElement>(`[data-sort-layout="${layout}"]`))
        .filter((element) => element.getClientRects().length > 0)
        .map((element) => [element.dataset.productId ?? "", element.getBoundingClientRect().top]),
    );
  }

  function animateReorderedItems(
    layout: DragPreview["layout"],
    previousPositions: Map<string, number>,
  ) {
    window.requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(`[data-sort-layout="${layout}"]`).forEach((element) => {
        const productId = element.dataset.productId;
        const previousTop = productId ? previousPositions.get(productId) : undefined;
        if (previousTop === undefined || element.getClientRects().length === 0) return;

        const offset = previousTop - element.getBoundingClientRect().top;
        if (Math.abs(offset) < 1) return;

        element.getAnimations().forEach((animation) => animation.cancel());
        element.animate(
          [
            { transform: `translateY(${offset}px)` },
            { transform: "translateY(0)" },
          ],
          {
            duration: REORDER_ANIMATION_DURATION,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          },
        );
      });
    });
  }

  function resetDragState() {
    touchDraggedIdRef.current = null;
    touchStartOrderRef.current = [];
    dragLayoutRef.current = null;
    dragPointerYRef.current = null;
    setDragPreview(null);
    setDraggedId(null);
  }

  function handlePointerDown(
    productId: string,
    layout: DragPreview["layout"],
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    if (isSavingOrder) return;

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const card = event.currentTarget.closest<HTMLElement>("[data-product-id]");
    const cardBounds = card?.getBoundingClientRect();

    if (!cardBounds) return;

    dragPointerYRef.current = event.clientY;
    touchDraggedIdRef.current = productId;
    touchStartOrderRef.current = itemsRef.current.map((item) => item.id);
    dragLayoutRef.current = layout;
    setDragPreview({
      productId,
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: cardBounds.width,
      layout,
    });
    setDraggedId(productId);
    setMessage(null);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const sourceId = touchDraggedIdRef.current;
    const layout = dragLayoutRef.current;
    if (!sourceId || !layout) return;

    event.preventDefault();
    dragPointerYRef.current = event.clientY;
    setDragPreview((current) => current ? {
      ...current,
      pointerX: event.clientX,
      pointerY: event.clientY,
    } : current);

    const targetElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-product-id]");
    const targetId = targetElement?.dataset.productId;

    if (!targetId || targetId === sourceId) {
      return;
    }

    const sourceIndex = itemsRef.current.findIndex((item) => item.id === sourceId);
    const targetIndex = itemsRef.current.findIndex((item) => item.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const targetBounds = targetElement.getBoundingClientRect();
    const targetMiddle = targetBounds.top + targetBounds.height / 2;
    const movingDown = sourceIndex < targetIndex;
    const crossedTargetMiddle = movingDown
      ? event.clientY > targetMiddle
      : event.clientY < targetMiddle;

    if (!crossedTargetMiddle) return;

    const previousPositions = getVisibleItemPositions(layout);
    setItems((currentItems) => {
      const nextItems = reorderListByIds(currentItems, sourceId, targetId);
      itemsRef.current = nextItems;
      return nextItems;
    });
    animateReorderedItems(layout, previousPositions);
  }

  function finishPointerDrag() {
    const sourceId = touchDraggedIdRef.current;
    if (!sourceId) return;

    const initialOrder = touchStartOrderRef.current;
    const nextItems = itemsRef.current;
    const previousItems = orderItemsByIds(nextItems, initialOrder);

    resetDragState();

    const nextOrder = nextItems.map((item) => item.id);
    const hasOrderChanged =
      initialOrder.length === nextOrder.length &&
      initialOrder.some((itemId, index) => itemId !== nextOrder[index]);

    if (hasOrderChanged) {
      void persistOrder(nextItems, previousItems);
    }
  }

  function cancelPointerDrag() {
    if (!touchDraggedIdRef.current) return;

    const previousItems = orderItemsByIds(itemsRef.current, touchStartOrderRef.current);
    itemsRef.current = previousItems;
    setItems(previousItems);
    resetDragState();
  }

  function handleOrderKeyDown(productId: string, event: ReactKeyboardEvent<HTMLButtonElement>) {
    const direction = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
    if (!direction || isSavingOrder) return;

    event.preventDefault();
    const previousItems = itemsRef.current;
    const currentIndex = previousItems.findIndex((item) => item.id === productId);
    const targetItem = previousItems[currentIndex + direction];
    if (!targetItem) return;

    const nextItems = reorderListByIds(previousItems, productId, targetItem.id);
    itemsRef.current = nextItems;
    setItems(nextItems);
    void persistOrder(nextItems, previousItems);
  }

  return (
    <div className="rounded-3xl bg-[#FFFFFF] shadow-lg ring-1 ring-black/5">
      <div className="flex items-start gap-3 border-b border-[#E6AECB] bg-[#FFF9FB] px-4 py-3 text-sm text-[#54342C] first:rounded-t-3xl sm:items-center">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#8A6A62] ring-1 ring-[#E6AECB] sm:mt-0">
          <DragHandleIcon size={16} />
        </span>
        <p>
          <span className="font-semibold">Чтобы поменять порядок,</span>{" "}
          <span className="lg:hidden">зажмите значок справа</span>
          <span className="hidden lg:inline">зажмите значок слева</span>
          {" "}и ведите карточку вверх или вниз. Отпустите — изменения сохранятся.
        </p>
      </div>
      {message ? (
        <div aria-live="polite" className="border-b border-[#E6AECB] px-4 py-3 text-sm font-semibold text-[#54342C]">
          {message}
        </div>
      ) : null}
      <div className="grid gap-4 p-4 lg:hidden">
        {items.map((product) => (
          <article
            key={product.id}
            data-product-id={product.id}
            data-sort-layout="mobile"
            className={`rounded-2xl bg-[#FFF9FB] p-3 ring-1 transition-[opacity,box-shadow] duration-150 ${
              draggedId === product.id
                ? "opacity-35 outline-dashed outline-2 outline-[#8A6A62] ring-[#E6AECB]"
                : "ring-[#E6AECB]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#FFF4F8]">
                <img src={product.imageUrl} alt={product.title} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#54342C]">{product.title}</p>
              </div>
              <button
                type="button"
                onPointerDown={(event) => handlePointerDown(product.id, "mobile", event)}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointerDrag}
                onPointerCancel={cancelPointerDrag}
                onLostPointerCapture={finishPointerDrag}
                onKeyDown={(event) => handleOrderKeyDown(product.id, event)}
                aria-label={`Изменить порядок товара ${product.title}`}
                aria-pressed={draggedId === product.id}
                disabled={isSavingOrder}
                className="inline-flex h-12 w-12 shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-2xl bg-white text-[#8A6A62] shadow-sm ring-1 ring-[#E6AECB] transition active:cursor-grabbing active:scale-95 disabled:cursor-wait disabled:opacity-50"
              >
                <DragHandleIcon size={20} />
              </button>
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

      {dragPreview ? (() => {
        const product = items.find((item) => item.id === dragPreview.productId);
        if (!product) return null;

        return (
          <div
            className="pointer-events-none fixed z-[100] rounded-2xl bg-[#FFF9FB] p-3 shadow-2xl ring-2 ring-[#E6AECB]"
            style={dragPreview.layout === "mobile" ? {
              left: 16,
              top: Math.max(12, dragPreview.pointerY - 40),
              width: "calc(100vw - 32px)",
              maxWidth: dragPreview.width,
            } : {
              left: dragPreview.pointerX + 18,
              top: dragPreview.pointerY - 36,
              width: 340,
              maxWidth: "calc(100vw - 32px)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#FFF4F8]">
                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <p className="min-w-0 flex-1 text-sm font-semibold text-[#54342C]">{product.title}</p>
              {dragPreview.layout === "desktop" ? (
                <span className="shrink-0 text-xs font-semibold text-[#8A6A62]">Перемещаем</span>
              ) : null}
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#8A6A62] ring-1 ring-[#E6AECB]">
                <DragHandleIcon size={16} />
              </div>
            </div>
          </div>
        );
      })() : null}

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
                data-product-id={product.id}
                data-sort-layout="desktop"
                className={`border-b border-[#E6AECB] text-center transition-[opacity,background-color] duration-150 last:border-b-0 ${
                  draggedId === product.id ? "bg-[#FFF4F8] opacity-35 outline-dashed outline-2 outline-[#8A6A62]" : ""
                }`}
              >
                <td className="px-3 py-4">
                  <button
                    type="button"
                    onPointerDown={(event) => handlePointerDown(product.id, "desktop", event)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerDrag}
                    onPointerCancel={cancelPointerDrag}
                    onLostPointerCapture={finishPointerDrag}
                    onKeyDown={(event) => handleOrderKeyDown(product.id, event)}
                    aria-label={`Изменить порядок товара ${product.title}`}
                    aria-pressed={draggedId === product.id}
                    disabled={isSavingOrder}
                    className="inline-flex h-11 w-11 cursor-grab touch-none select-none items-center justify-center rounded-2xl bg-[#FFF4F8] text-[#8A6A62] ring-1 ring-[#E6AECB] transition hover:bg-white hover:shadow-sm active:cursor-grabbing active:scale-95 disabled:cursor-wait disabled:opacity-50"
                  >
                    <DragHandleIcon size={18} />
                  </button>
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
