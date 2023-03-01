import { Comment } from  'react-loader-spinner';

export default function LoaderSpinner() {
    return (
        <Comment
            visible={true}
            height="80"
            width="80"
            ariaLabel="comment-loading"
            wrapperStyle={{}}
            wrapperClass="comment-wrapper"
            color="#fff"
            backgroundColor="#6366f1"
        />
    )
};