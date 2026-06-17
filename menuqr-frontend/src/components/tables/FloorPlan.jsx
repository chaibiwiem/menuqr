import { useCallback, useRef } from 'react';
import {
  DndContext,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TableBadge from './TableBadge';

const GRID_COLS = 12;
const GRID_ROWS = 8;
const CELL_PX = 80;

function DraggableTable({ table, onSelect, selected, draggable }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: table.id,
    data: { table },
    disabled: !draggable,
  });

  const style = {
    position: 'absolute',
    left: table.position_x * CELL_PX,
    top: table.position_y * CELL_PX,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.85 : 1,
    cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
    touchAction: 'none',
  };

  return (
    <div ref={setNodeRef} style={style} {...(draggable ? listeners : {})} {...(draggable ? attributes : {})}>
      <TableBadge
        table={table}
        onClick={(e) => { e.stopPropagation(); onSelect(table); }}
        selected={selected}
        size="md"
      />
    </div>
  );
}

export default function FloorPlan({ tables, selectedId, onSelect, onPositionChange, draggable = true }) {
  const debounceRef = useRef({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = useCallback(
    ({ active, delta }) => {
      const table = tables.find((t) => t.id === active.id);
      if (!table) return;

      const cellsDeltaX = Math.round(delta.x / CELL_PX);
      const cellsDeltaY = Math.round(delta.y / CELL_PX);

      const newX = Math.max(0, Math.min(GRID_COLS - 1, table.position_x + cellsDeltaX));
      const newY = Math.max(0, Math.min(GRID_ROWS - 1, table.position_y + cellsDeltaY));

      if (newX === table.position_x && newY === table.position_y) return;

      // Optimistic update via parent
      onPositionChange(table.id, newX, newY);

      // Debounce API call (500ms)
      clearTimeout(debounceRef.current[table.id]);
      debounceRef.current[table.id] = setTimeout(() => {
        // parent calls PATCH — signal via onPositionChange with persist=true
        onPositionChange(table.id, newX, newY, true);
      }, 500);
    },
    [tables, onPositionChange]
  );

  const gridW = GRID_COLS * CELL_PX;
  const gridH = GRID_ROWS * CELL_PX;

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        className="relative overflow-auto rounded-2xl border border-gray-200 bg-gray-50"
        style={{ minHeight: gridH + 16 }}
      >
        {/* Grid dots background */}
        <div
          className="absolute inset-0"
          style={{
            width: gridW,
            height: gridH,
            backgroundImage:
              'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
            backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
            backgroundPosition: `${CELL_PX / 2}px ${CELL_PX / 2}px`,
          }}
        />

        {/* Tables */}
        <div style={{ position: 'relative', width: gridW, height: gridH }}>
          {tables.map((table) => (
            <DraggableTable
              key={table.id}
              table={table}
              onSelect={onSelect}
              selected={selectedId === table.id}
              draggable={draggable}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
