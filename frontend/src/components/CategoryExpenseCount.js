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
        Category Expense Count
      </h3>

      <table style={{ width: "100%", fontSize: "14px" }}>
        <thead>
          <tr>
            <th
              style={{
              textAlign: "center",
              padding: "12px 20px",
              width: "50%",
              fontSize: "14px",
              }}
            >
              Category
            </th>
            <th
              style={{
              textAlign: "center",
              padding: "12px 20px",
              width: "50%",
              fontSize: "14px",
              }}
            >
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