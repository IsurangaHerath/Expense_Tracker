## UC-EXP-001: Add Expense

### Basic Flow
1. User navigates to "Add Expense" page
2. System displays blank expense form with default date (today)
3. User enters amount
4. User selects category from dropdown
5. User optionally enters description
6. User clicks "Save Expense" button
7. System validates all inputs
8. System creates expense record in database
9. System redirects to expense list with success message

### Alternative Flows
- A1: Amount is negative/zero → System shows error "Amount must be positive"
- A2: Future date selected → System shows error "Date cannot be in the future"
- A3: Invalid format → System shows field-specific error

### Error Flows
- E1: Database error → System shows "Unable to save expense"
- E2: Validation error → System shows specific validation messages

### Preconditions
- User is authenticated
- User has access to category dropdown

### Postconditions
- Expense record created
- Expense appears in list view

---

## UC-EXP-002: View Expenses

### Basic Flow
1. User navigates to "Expenses" page
2. System retrieves user's expenses from database
3. System displays expenses in list view, sorted by date (newest first)
4. System paginates results (>50 shows pagination controls)

### Alternative Flows
- A1: No expenses exist → System shows "No expenses recorded yet"
- A2: Very large data set → System applies pagination

### Preconditions
- User is authenticated

### Postconditions
- User sees list of their expenses

---

## UC-EXP-003: Edit Expense

### Basic Flow
1. User navigates to expense list
2. User clicks "Edit" on desired expense
3. System loads expense data into form
4. User modifies fields
5. User clicks "Save Changes"
6. System validates changes
7. System updates expense record
8. System shows success message and returns to list

### Preconditions
- User is owner of expense
- System is online

### Postconditions
- Expense record updated with new values

---

## UC-EXP-004: Delete Expense

### Basic Flow
1. User navigates to expense list
2. User clicks "Delete" on desired expense
3. System shows confirmation dialog
4. User confirms deletion
5. System deletes expense record from database
6. System refreshes expense list

### Alternative Flows
- A1: User cancels → System returns to list without deletion

### Preconditions
- User is owner of expense

### Postconditions
- Expense record permanently removed

---

## UC-DASH-001: View Dashboard

### Basic Flow
1. User authenticates and accesses dashboard
2. System calculates total expenses for user
3. System calculates period summaries (month, YTD, all-time)
4. System retrieves category breakdown
5. System displays all summaries and statistics
6. System shows expense chart

### Preconditions
- User is authenticated

### Postconditions
- User sees overview of their financial data

---

## UC-SF-001: Search Expenses

### Basic Flow
1. User is on expenses list page
2. User types in search bar
3. System filters expenses matching query
4. Results update in real-time (debounced 300ms)
5. User sees filtered results

### Preconditions
- User has expenses to search

### Postconditions
- User sees matching expenses

---

## UC-SF-002: Filter Expenses

### Basic Flow
1. User selects category filter
2. System shows only expenses in that category
3. User selects date range filter
4. System shows expenses in date range
5. Filters can be combined

### Preconditions
- User is on expenses list page

### Postconditions
- User sees filtered expense list