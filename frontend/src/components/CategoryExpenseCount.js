import CategoryBadge from "./CategoryBadge";

const CategoryExpenseCount = ({ categories, expenses }) => {
  if (!categories || categories.length === 0) {
    return <p>No categories found.</p>;
  }

  if (!expenses) {
    return <p>Loading expenses...</p>;
  }

  const getExpenseCount = (categoryId) => {
    return expenses.filter(
      (expense) =>
        Number(expense.category_id) === Number(categoryId)
    ).length;
  };

  return (
    <div className="category-expense-count">
      <h3 style={{ textAlign: "center" }}>
        Category-wise Expense Count
      </h3>

      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "center" }}>
              Category
            </th>
            <th style={{ textAlign: "center" }}>
              Number of Expenses
            </th>
          </tr>
        </thead>

        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td style={{ textAlign: "center" }}>
                <CategoryBadge
                  name={category.name}
                  color={category.color}
                  size="medium"
                />
              </td>

              <td style={{ textAlign: "center" }}>
                {getExpenseCount(category.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryExpenseCount;