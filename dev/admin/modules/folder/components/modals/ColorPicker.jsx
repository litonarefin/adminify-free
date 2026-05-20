/**
 * ColorPicker Component
 * Reusable color picker for folder color selection
 */

import React from 'react';

const ColorPicker = ({ colors, activeColor, onColorSelect, label = 'Colour Tag' }) => {
    const handleColorClick = (e, color) => {
        e.preventDefault();
        onColorSelect(color);
    };

    return (
        <div className="popup--new-folder__color">
            <div>{label}</div>
            <div>
                <ul className="wp-adminify--colors">
                    {colors.map((color) => (
                        <li
                            key={color}
                            className={color === activeColor ? 'active' : ''}
                        >
                            <a
                                href="#"
                                onClick={(e) => handleColorClick(e, color)}
                                style={{ background: color }}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ColorPicker;
