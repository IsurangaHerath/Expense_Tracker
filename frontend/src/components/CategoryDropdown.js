const CategoryDropdown = ({
  selectedCategoryId,
  onCategoryChange,
  categories,
  loading,
  error
}) => {

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Failed to load categories</div>;
  }

  return (
    <div className="category-dropdown">

      <label>Category</label>

      <select
        value={selectedCategoryId || ""}
        onChange={(e) =>
          onCategoryChange(Number(e.target.value))
        }
      >

        <option value="">
          Select a category
        </option>

        {categories.map((category) => (
          <option
            key={category.id}
            value={category.id}
          >
            {category.name}
          </option>
        ))}

      </select>

    </div>
  );
};

export default CategoryDropdown;