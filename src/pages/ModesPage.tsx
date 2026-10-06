import { Link, Navigate, useParams } from "react-router-dom";
import { categories, gameModes } from "../data/phrasalVerbs";
import { Layout } from "../components/Layout";

export function ModesPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = categories.find((c) => c.id === categoryId);

  if (!category) return <Navigate to="/" replace />;
  if (!category.available) return <Navigate to="/" replace />;

  return (
    <Layout
      backTo="/"
      backLabel="Категорії"
      title={category.title}
      subtitle={`${category.titleUk} · ${category.description}`}
    >
      <div className="modes-grid">
        {gameModes.map((mode) => (
          <Link
            key={mode.id}
            to={`/category/${categoryId}/play/${mode.id}`}
            className="mode-card"
          >
            <div className="mode-multiplier">×{mode.multiplier}</div>
            <h3>{mode.title}</h3>
            <p>{mode.description}</p>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
