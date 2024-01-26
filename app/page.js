// Import necessary styles for drag-and-drop
"use client"
import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Resizable } from 'react-resizable';
import 'tailwindcss/tailwind.css';

// Extract ResizableBox component
const ResizableBox = ({ width, height, onResize, children }) => {
  return (
    <Resizable width={width} height={height} onResize={onResize} draggableOpts={{ enableUserSelectHack: false }}>
      <div className="resize-handle">{children}</div>
    </Resizable>
  );
};

const DraggableElement = ({ type, index, onTextChange, onImageChange, onElementDelete, onMove, elements }) => {
  console.log('Type:', type);

  const [, drag] = useDrag({
    type: type && typeof type === 'string' ? type : 'DEFAULT_TYPE',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'ELEMENT',
    hover: (item, monitor) => {
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className="mb-4">
      <ResizableBox width={elements[index]?.width || 200} height={elements[index]?.height || (type === 'text' ? 100 : 200)} onResize={(e, data) => onResize(index, data)}>
        {type === 'text' ? (
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md text-black"
            value={elements[index]?.text || ''}
            onChange={(e) => onTextChange(index, e.target.value)}
            placeholder="Enter text..."
          />
        ) : (
          <div>
            <input
              type="file"
              onChange={(e) => onImageChange(index, URL.createObjectURL(e.target.files[0]))}
              accept="image/*"
            />
            {elements[index]?.image && <img src={elements[index]?.image} alt="Uploaded" />}
          </div>
        )}
      </ResizableBox>
      <button onClick={() => onElementDelete(index)} className="mt-2 px-2 py-1 bg-red-500 text-white rounded">
        Delete
      </button>
    </div>
  );
};

const WebsiteCreator = () => {
  const [elements, setElements] = useState([]);

  const handleDrop = (event) => {
    event.preventDefault();
    const elementType = event.dataTransfer.getData('text/plain');
    setElements((prevElements) => [...prevElements, { type: elementType }]);
  };

  const handleTextChange = (index, newText) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements[index].text = newText;
      return updatedElements;
    });
  };

  const handleImageChange = (index, newImage) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements[index].image = newImage;
      return updatedElements;
    });
  };

  const handleResize = (index, data) => {
    const { size } = data;

    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements[index].width = size.width;
      updatedElements[index].height = size.height;

      return updatedElements;
    });
  };

  const handleElementDelete = (index) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      updatedElements.splice(index, 1);
      return updatedElements;
    });
  };

  const handleSave = () => {
    localStorage.setItem('websiteSection', JSON.stringify(elements));
    console.log('Website section saved:', elements);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-3xl mx-auto p-8">
        <div onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} className="border border-gray-300 min-h-[300px] p-4 rounded-lg shadow-md bg-white">
          {elements.map((element, index) => (
            <DraggableElement
              key={index}
              type={element.type}
              index={index}
              onTextChange={handleTextChange}
              onImageChange={handleImageChange}
              onResize={handleResize}
              onElementDelete={handleElementDelete}
              onMove={(dragIndex, hoverIndex) => {
                const updatedElements = [...elements];
                const [removed] = updatedElements.splice(dragIndex, 1);
                updatedElements.splice(hoverIndex, 0, removed);
                setElements(updatedElements);
              }}
              elements={elements}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="mr-2 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setElements((prevElements) => [...prevElements, { type: 'text' }])}>
            Add Text
          </button>
          <button className="mr-2 px-4 py-2 bg-green-500 text-white rounded" onClick={() => setElements((prevElements) => [...prevElements, { type: 'image' }])}>
            Add Image
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

export default WebsiteCreator;
