import React from 'react'
import Link from '@docusaurus/Link'
import styles from './RecentPosts.module.css'

// Quick & dirty hack to get list of blog posts
// (the "proper" way would be a custom plugin)
import BlogPosts from "../../.docusaurus/docusaurus-plugin-content-blog/default/blog-post-list-prop-default.json"

function getPostDate(permalink) {
    const matches = permalink.match(/\d{4}\/\d{2}\/\d{2}/g);
    if (matches.length === 1) {
        const matchDate = new Date(matches[0]);
        return matchDate.toLocaleString('en-us',
            { month: 'short', year: 'numeric' })
    } else {
        return null
    }
}

function BlogDate({ date }) {
    return (<span className={styles.date}>
        {date}
    </span>)
}

function BlogList() {
    const posts = BlogPosts.items;
    return (<div className={styles.bloglist}>
        {posts
            .filter(({ unlisted }) => !unlisted)
            .slice(0, 3)
            .map(({ title, permalink }) => {
                const date = getPostDate(permalink);
                return (<li key={permalink} className={styles.post}>
                    {date && <BlogDate date={date} />}
                    <Link to={permalink} style={{ textDecoration: "none" }}>
                        {title}
                    </Link>
                </li>)
            }
            )}

    </div>)
}



export default function RecentPosts() {
    return (<div>
        <h3>Read the latest blog posts</h3>
        <BlogList />
        <Link to="blog">
            More posts
        </Link>
    </div>)
}



