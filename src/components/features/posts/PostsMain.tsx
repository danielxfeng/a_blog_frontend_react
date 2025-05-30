import MotionH1 from '@/components/motion_components/MotionH1';
import PostsList from '@/components/features/posts/PostList';
import PostsFilterForm from '@/components/features/posts/PostsFilterForm';
import { PostListResponse } from '@/schema/schema_post';
import { TagsResponse } from '@/schema/schema_tag';

/**
 * The main component for the posts shared with the listing and search pages.
 * It contains a filter form and a list of posts.
 */
const PostsMain = ({
  postsListRes,
  hotTags,
  children,
}: {
  postsListRes: PostListResponse;
  hotTags: TagsResponse;
  children: React.ReactNode;
}) => {
  return (
    <>
      {children}
      <div className='inner-container flex flex-col items-start'>
        <MotionH1>Posts</MotionH1>
        <div className='posts flex flex-col-reverse gap-10 lg:flex-row lg:justify-between'>
          <div className='w-full lg:w-1/4'>
            <PostsFilterForm hotTags={hotTags} />
          </div>
          <div className='w-full lg:w-3/4'>
            <PostsList postsResponse={postsListRes} />
          </div>
        </div>
      </div>
    </>
  );
};

export default PostsMain;
