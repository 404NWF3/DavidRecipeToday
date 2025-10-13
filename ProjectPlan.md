# 实现计划

#### **第一步：数据库设计与建模 (Database Design)**

这是项目的基石，你已经准确地指出了核心是 `Recipes` 和 `Ingredients` 的多对多关系。让我们深化这个设计。

**1. 核心表 (Core Tables):**

- **`ingredients` (食材表)**
  - `id` (INT, Primary Key, Auto Increment): 唯一标识符
  - `name` (VARCHAR): 食材名称 (e.g., "鸡蛋", "西红柿", "酱油")
  - `category` (VARCHAR, Optional): 食材分类 (e.g., "蔬菜", "肉类", "调味品")
  - `created_at` (TIMESTAMP): 创建时间
- **`recipes` (菜谱表)**
  - `id` (INT, Primary Key, Auto Increment): 唯一标识符
  - `title` (VARCHAR): 菜谱名称 (e.g., "西红柿炒鸡蛋")
  - `description` (TEXT): 菜谱描述
  - `instructions` (TEXT): 烹饪步骤
  - `prep_time_minutes` (INT): 准备时间（分钟）
  - `cook_time_minutes` (INT): 烹饪时间（分钟）
  - `servings` (INT): 份量
  - `image_url` (VARCHAR, Optional): 菜谱图片链接
  - `created_at` (TIMESTAMP): 创建时间
- **`recipe_ingredients` (菜谱-食材关系表 - \*核心中的核心\*)**
  - `id` (INT, Primary Key, Auto Increment)
  - `recipe_id` (INT, Foreign Key -> `recipes.id`): 关联到菜谱
  - `ingredient_id` (INT, Foreign Key -> `ingredients.id`): 关联到食材
  - `quantity` (VARCHAR): 所需数量 (e.g., "2个", "100克", "1汤匙")。使用 `VARCHAR` 是因为单位不统一。
  - `is_optional` (BOOLEAN, Default: FALSE): 标记该食材是否为可选（例如装饰用的香菜）

**2. 辅助表 (Supporting Tables) - 用于过滤和扩展功能:**

- **`tags` (标签表)**
  - `id` (INT, Primary Key)
  - `name` (VARCHAR, Unique): 标签名 (e.g., "素食", "快手菜", "家常菜", "川菜")
- **`recipe_tags` (菜谱-标签关系表)**
  - `recipe_id` (INT, Foreign Key -> `recipes.id`)
  - `tag_id` (INT, Foreign Key -> `tags.id`)

**实体关系图 (ERD) 概念:**

```
[recipes] 1--* [recipe_ingredients] *--1 [ingredients]
   |
   |
   1
   |
   *
[recipe_tags]
   *
   |
   1
   |
   |
[tags]
```

------



#### **第二步：数据采集与填充 (Data Population)**



一个好的数据库需要有数据。

1. **手动录入**: 初期可以手动录入10-20个经典菜谱，用于测试算法。
2. **网络爬虫**: 编写Python爬虫（例如使用 Scrapy 或 BeautifulSoup）从美食网站（如 "下厨房"、"美食杰"）抓取数据。**注意：** 务必遵守网站的`robots.txt`协议，并尊重版权。
3. **使用API**: 寻找公开的菜谱API（如 TheMealDB, Spoonacular 等），通过API获取结构化的菜谱数据，这是最规范和高效的方式。

------



#### **第三步：核心匹配算法的开发 (Backend Logic)**



这是你提到的“查询逻辑”挑战，也是整个项目的灵魂。简单的SQL查询无法满足需求，我们需要一个排序/打分机制。

假设用户输入的食材列表是 `user_ingredients = [鸡蛋, 西红柿, 葱]`。

**算法思路：为每个菜谱计算一个“匹配得分”**

1. **遍历数据库中的每一个菜谱 (`recipe`)。**

2. **获取该菜谱所需的所有食材 `recipe_ingredients`。**

3. **计算匹配度：**

   - `matched_count`: 用户拥有的食材中有多少种是该菜谱需要的。
   - `missing_count`: 该菜谱需要的食材中有多少种是用户没有的。
   - `total_required`: 该菜谱总共需要多少种主要食材。

4. 设计一个排序函数 (Ranking Function):

   一个简单的排序得分可以是：

   

   $$$$其中 ![img](data:,) 和 ![img](data:,) 是权重。我们优先推荐“匹配度高”且“缺失食材少”的菜谱。例如，可以优先展示 `missing_count = 0` 或 `missing_count = 1` 的菜谱。

**SQL实现思路 (以PostgreSQL为例):**

你可以用一个比较复杂的SQL查询来完成这个计算。假设用户输入的食材ID列表是 `(1, 5, 10)`:

SQL

```
SELECT
    r.id,
    r.title,
    -- 计算菜谱总共需要多少食材
    (SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.id) as total_required,
    -- 计算用户拥有的食材匹配上了多少
    COUNT(ri.ingredient_id) as matched_count,
    -- 计算还缺失多少食材
    ((SELECT COUNT(*) FROM recipe_ingredients WHERE recipe_id = r.id) - COUNT(ri.ingredient_id)) as missing_count
FROM
    recipes r
JOIN
    recipe_ingredients ri ON r.id = ri.recipe_id
WHERE
    -- 只在我们关心的、用户拥有的食材里进行匹配
    ri.ingredient_id IN (1, 5, 10) -- 这里是用户输入的食材ID列表
GROUP BY
    r.id, r.title
ORDER BY
    -- 排序逻辑：优先显示缺失少的，其次显示匹配多的
    missing_count ASC,
    matched_count DESC;
```

*这个SQL是一个很好的起点，它直接返回了按匹配度排序的菜谱列表。后端拿到这个列表后就可以直接展示给用户。*

------



#### **第四步：构建应用与API (Application & API)**



1. **后端 (Backend):**
   - 选择一个你熟悉的框架，考虑到你的背景，Python的 **Django** 或 **Flask** 会是非常好的选择。
   - 创建一个API端点 (Endpoint)，例如 `/api/find_recipes`。
   - 这个API接收一个食材列表作为输入（`POST` 请求的 body 或 `GET` 请求的参数）。
   - API内部执行第三步中的算法逻辑（执行SQL查询或在代码中计算得分）。
   - 返回一个JSON格式的菜谱列表，包含菜谱名称、图片、匹配得分、缺失的食材等信息。
2. **前端 (Frontend):**
   - 设计一个简洁的界面，让用户可以方便地勾选或输入他们拥有的食材。
   - 提供一个“开始烹饪！”按钮，点击后调用后端的API。
   - 用卡片的形式美观地展示返回的菜谱列表。每张卡片上可以显示：
     - 菜谱图片
     - 菜谱名称
     - 匹配度（例如，“用上了你80%的食材”）
     - 还需准备（例如，“还差1样：酱油”）
   - 点击卡片可以跳转到菜谱详情页，展示完整的用料和烹饪步骤。

------



#### **第五步：迭代与高级功能 (Advanced Features)**



当核心功能完成后，你可以利用你在机器学习和优化方面的兴趣来增加亮点：

1. **智能食材替换建议**: "你没有鸡肉，但有豆腐，可以试试做素食版的麻婆豆腐。" 这需要建立食材之间的可替代关系图。
2. **个性化推荐**: 基于用户的查询历史和点赞/收藏的菜谱，使用协同过滤等算法为他推荐可能喜欢的新菜谱。
3. **库存管理**: 允许用户维护一个虚拟的“我的冰箱”，系统可以主动推送“你的牛奶快过期了，可以做这些...”
4. **优化购物清单**: 如果用户想做某个菜但缺少几样食材，系统可以生成一个最优购物清单，甚至可以一次性购买能做多个菜的食材组合。
5. **支持过滤**: 在查询时加入`tags`表的逻辑，允许用户筛选“素食”、“快手菜”等。这在SQL查询的`WHERE`或`JOIN`子句中很容易实现。



#### **技术选型建议 (Tech Stack)**



- **数据库**: **PostgreSQL** (功能强大，对复杂查询支持良好) 或 **MySQL**。
- **后端**: **Python (Flask / Django)** (生态成熟，数据处理和算法实现方便)。
- **前端**: **React / Vue.js** (现代化的前端框架，可以构建交互性强的用户界面)。
- **部署**: **Docker** + **Nginx** + **Gunicorn**，可以部署在任何云服务器上。

这个项目从一个简单的数据库查询，可以逐步演变成一个包含复杂算法和机器学习模型的智能应用，非常适合锻炼你的综合能力。祝你项目顺利！