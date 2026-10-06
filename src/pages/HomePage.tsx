import { Link } from "react-router-dom";
import { categories } from "../data/phrasalVerbs";
import { Layout } from "../components/Layout";

const cardColors = ["c-teal", "c-coral", "c-lime", "c-lavender", "c-sky", "c-gold"];

export function HomePage() {
  return (
    <Layout
      title="Грай та вчися"
      subtitle="Обери категорію — фразові дієслова, лексика та інше"
    >
      <div className="category-grid">
        {categories.map((cat, index) => {
          const color = cardColors[index % cardColors.length];
          if (!cat.available) {
            return (
              <div key={cat.id} className={`category-card ${color} disabled`}>
                <span className="category-badge">скоро</span>
                <h2>{cat.title}</h2>
                <p className="category-uk">{cat.titleUk}</p>
                <p className="category-desc">{cat.description}</p>
              </div>
            );
          }

          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`category-card ${color}`}
            >
              <span className="category-badge">{cat.wordCount} слів</span>
              <h2>{cat.title}</h2>
              <p className="category-uk">{cat.titleUk}</p>
              <p className="category-desc">{cat.description}</p>
              <span className="category-cta">Грати ⟶</span>
            </Link>
          );
        })}
      </div>
    </Layout>
  );
}
