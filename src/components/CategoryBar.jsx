
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

const categories = [
  "All",
  "Gaming",
  "Live",
  "Grand Theft Auto VI",
  "Music",
  "Esports",
  "Game shows",
  "Mixes",
  "Wickets",
  "Game for Peace",
  "Data Structures",
  "Engineering mathematics",
  "Machine learning",
  "Recently uploaded",
];

function CategoryBar() {

  const [activeCategory, setActiveCategory] = useState("All");

  return (
    <div className="category-wrapper">

      <div className="category-list">

        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              activeCategory === category ? "selected" : ""
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}

      </div>

      <button
        className="category-next"
        aria-label="Next categories"
      >
        <ChevronRight size={22} />
      </button>

    </div>
  );
}

export default CategoryBar;
