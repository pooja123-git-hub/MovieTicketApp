import axios from 'axios'

export const getNowPlayingMovie=async(req,res)=>{
    try {
       const {data} = await axios.get('https://api.themoviedb.org/3/movie/now_playing',{
headers:{Authorization:`Bearer ${process.env.TMDB_API_KEY}`}
    })
    const movies=data.results;
    res.json({sucess:true,movies:movies})
    } catch (error) {
        console.log(error);
            res.json({sucess:false,message:error.message})
    }
}