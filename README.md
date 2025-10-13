# 大卫戴今天吃什么？- Pantry-to-Plate Recipe Generator

**一个基于用户持有食材的智能菜谱生成器，旨在解决“今晚吃什么”的终极难题，并帮助减少食物浪费。**

[English Version](./README.en.md) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
---

## 目录

- [项目构想](#项目构想)
- [主要功能](#主要功能)
- [技术栈](#技术栈)
- [数据库设计](#数据库设计)
- [核心匹配算法](#核心匹配算法)
- [快速开始](#快速开始)
  - [环境准备](#环境准备)
  - [安装与运行](#安装与运行)
- [API 接口说明](#api-接口说明)
- [如何贡献](#如何贡献)
- [未来计划 (Roadmap)](#未来计划-roadmap)
- [开源协议](#开源协议)

## 项目构想

我们经常面临这样的窘境：打开冰箱，看到一堆食材，却不知道能做什么菜。这个项目就是为了解决这个痛点。用户只需输入他们手头现有的几种食材，系统就能智能地查询数据库，并返回一份或多份可以使用这些食材制作的菜谱。此外，用户还可以根据自己的偏好（如“素食”、“快手菜”、“川菜”等）对结果进行筛选，从而轻松找到完美的烹饪灵感。

**核心价值:**
* **减少食物浪费**: 帮助用户最大化利用现有食材。
* **激发烹饪灵感**: 解决“不知道做什么”的日常难题。
* **个性化体验**: 根据用户的偏好和饮食习惯提供建议。

## 主要功能

* **食材查询**: 输入2种或以上食材，获取相关菜谱推荐。
* **智能排序**: 菜谱列表根据“食材匹配度”和“缺失食材数量”进行智能排序。
* **高级筛选**: 支持按标签（如“素食”、“快手菜”）、烹饪时间等进行过滤。
* **菜谱详情**: 查看完整的食材清单、烹饪步骤、准备时间等。
* **RESTful API**: 提供清晰的API接口，便于前后端分离开发或第三方应用集成。

## 技术栈

* **后端**: Python (使用 Flask / Django 框架)
* **数据库**: PostgreSQL / MySQL
* **前端 (示例)**: React / Vue.js / Svelte
* **部署**: Docker, Nginx, Gunicorn
* **数据采集 (可选)**: Scrapy / BeautifulSoup

## 数据库设计

数据库是本项目的核心。我们设计了以下几张表来高效地存储和查询数据：

* **`ingredients` (食材表)**: 存储所有独立的食材信息。
    * `id`, `name`, `category`
* **`recipes` (菜谱表)**: 存储菜谱的基本信息。
    * `id`, `title`, `description`, `instructions`, `prep_time_minutes`, `cook_time_minutes`
* **`recipe_ingredients` (菜谱-食材关系表)**: 这是实现多对多关系的关键。
    * `recipe_id` (外键), `ingredient_id` (外键), `quantity` (e.g., "100克")
* **`tags` (标签表)**: 用于菜谱分类。
    * `id`, `name` (e.g., "素食", "快手菜")
* **`recipe_tags` (菜谱-标签关系表)**: 连接菜谱和标签。
    * `recipe_id` (外键), `tag_id` (外键)

## 核心匹配算法

为了从众多菜谱中找到最匹配的选项，我们设计了一个基于加权评分的排序算法。对于数据库中的每一个菜谱，我们计算一个 **匹配分 (Score)**：

$$
\text{Score} = w_1 \times \frac{\text{matched\_count}}{\text{total\_required}} - w_2 \times \text{missing\_count}
$$

其中：
* `matched_count`: 用户拥有的食材与菜谱所需食材的匹配数量。
* `total_required`: 菜谱总共需要的主要食材数量。
* `missing_count`: 菜谱所需但用户没有的食材数量。
* $w_1$ 和 $w_2$ 是可调整的权重，用于控制“匹配度”和“惩罚缺失项”的重要性。

最终，我们会优先向用户展示 **Score 最高** 且 **`missing_count` 尽可能低** 的菜谱。

## 快速开始

### 环境准备

* Python 3.9+
* PostgreSQL 12+ 或 MySQL 8+
* Git

### 安装与运行

1.  **克隆仓库**
    ```bash
    git clone [https://github.com/你的用户名/pantry-to-plate.git](https://github.com/你的用户名/pantry-to-plate.git)
    cd pantry-to-plate
    ```

2.  **创建并激活虚拟环境**
    ```bash
    python -m venv venv
    source venv/bin/activate  # on Windows, use `venv\Scripts\activate`
    ```

3.  **安装依赖**
    ```bash
    pip install -r requirements.txt
    ```

4.  **配置环境变量**
    复制 `.env.example` 文件为 `.env`，并填入你的数据库连接信息等。
    ```bash
    cp .env.example .env
    # 使用你喜欢的编辑器修改 .env 文件
    ```

5.  **初始化数据库**
    ```bash
    # (这通常是一个自定义的 flask/django 命令)
    flask db init
    flask db migrate
    flask db upgrade
    ```

6.  **运行应用**
    ```bash
    flask run
    ```
    现在，应用应该运行在 `http://127.0.0.1:5000`。

## API 接口说明

### `POST /api/recipes/find`

根据用户食材查找菜谱。

**请求体 (Request Body):**
```json
{
  "ingredient_ids": [1, 5, 10],
  "filters": {
    "tags": ["快手菜", "素食"],
    "max_cook_time": 30
  }
}
```

**成功响应 (Success Response):**
```json
{
  "results": [
    {
      "id": 123,
      "title": "西红柿炒鸡蛋",
      "image_url": "...",
      "match_score": 0.95,
      "matched_ingredients": ["鸡蛋", "西红柿"],
      "missing_ingredients": ["葱"]
    }
  ]
}
```

## 如何贡献

我们非常欢迎社区的贡献！无论你是数据科学家、后端开发者还是前端工程师，都可以找到可以参与的地方。

1.  **Fork** 本仓库
2.  创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3.  提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  提交一个 **Pull Request**

## 未来计划 (Roadmap)

* [ ] **智能食材替换**: "没有猪肉？试试用鸡肉！"
* [ ] **个性化推荐**: 基于用户历史行为推荐菜谱。
* [ ] **库存管理**: 允许用户建立自己的“云冰箱”。
* [ ] **购物清单生成**: 一键生成所需食材的购物清单。
* [ ] **集成外部API**: 接入更多菜谱数据源。

## 开源协议

该项目采用 [MIT License](LICENSE.md) 开源协议。