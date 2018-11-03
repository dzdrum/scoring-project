# scoring-project
Node.js and MySQL

This is a HTML file parser. The program will read a directory and parse each html document within to create a score based
upon HTML tags. These scores will then be added to a MySQL database. The program also has different functions that the user
can then choose to analyze the data that is stored. This includes getting the average scores, getting the scores for a custom data range, getting the scores for a certain file name and more.

Scoring Project
=============

>**Languages and tools used:**
>
>- Node v10.1.0
>- NPM v6.0.1
>- MySQL 8.0.12
>- Atom as my IDE
>- macOS High Sierra
>
>**Instructions**
>
>1. Start a local SQL server instance (I used 'mysql.server start' in the Terminal).
>2. Open up the MySQL command line
>3. Run SQL commands found in /schema/scoring_schema.sql to create the database and tables.
>4. Create a file named .env at the root of the directory
>5. Add these three lines to the .env file with your specific mysql information
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=yourpasswordhere
>5. Navigate to the project's root directory
>6. run `npm install` to install all dependencies
>7. run `npm start` to start up the program

=============

Scoring Rules
-------------
Each starting tag in the table below has been assigned a score. Any tags not listed in this table will not factor into scoring. Each tag in the content should be added to or subtracted from the total score based on this criteria.

| TagName | Score Modifier | TagName | Score Modifier |
| ------- | :------------: | ------- | -------------- |
| div     | 3              | font    | -1             |
| p       | 1              | center  | -2             |
| h1      | 3              | big     | -2             |
| h2      | 2              | strike  | -1             |
| html    | 5              | tt      | -2             |
| body    | 5              | frameset| -5             |
| header  | 10             | frame   | -5             |
| footer  | 10             |

example:

````
<html>
    <body>
      <p>foo</p>
      <p>bar</p>
      <div text-align='center'>
        <big>hello world</big>
      </div>
    </body>
</html>
````

2 p tags = 2 x 1 <br>
1 body tag = 1 x 5 <br>
1 html tag = 1 x 5 <br>
1 div tag = 1 x 3 <br>
1 big tag = 1 x -2 <br>
**Total Score: 13**
