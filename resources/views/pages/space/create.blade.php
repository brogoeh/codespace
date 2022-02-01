@extends('layouts.app')

@section('content')
<div class="container">
    <x-navigation></x-navigation>
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Create pin location') }}</div>

                <div class="card-body">
                    {!! Form::open(['route' => 'space.store', 'method' => 'post', 'files' => true])  !!}

                    <div class="form-group">
                        <label for="title">Title</label>
                        {!! Form::text('title', null, ['class' => $errors->has('title') ? 'form-cotrol, is-invalid' : 'form-control'])!!}
                        @error('title')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{$message}}</strong>
                            </span>
                        @enderror

                        <label for="address">Address</label>
                        {!! Form::textarea('address', null, [
                        'class' => $errors->has('address') ? 'form-cotrol, is-invalid' : 'form-control'
                        ])!!}
                        @error('address')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{$message}}</strong>
                            </span>
                        @enderror

                        <label for="description">Description</label>
                        {!! Form::textarea('description', null, [
                        'class' => $errors->has('description') ? 'form-cotrol, is-invalid' : 'form-control'
                        ])!!}
                        @error('description')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{$message}}</strong>
                            </span>
                        @enderror

                        <div id="here-maps">
                            <label for="pin">Pin Location</label>
                            <div style="height: 500px" id="mapContainer"></div>
                        </div>

                        <label for="latitude">Latitude</label>
                        {!! Form::text('latitude', null, ['class' => $errors->has('latitude') ? 'form-cotrol, is-invalid' : 'form-control', 'id' => 'lat'])!!}
                        @error('latitude')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{$message}}</strong>
                            </span>
                        @enderror

                        <label for="longitude">Longitude</label>
                        {!! Form::text('longitude', null, ['class' => $errors->has('longitude') ? 'form-cotrol, is-invalid' : 'form-control', 'id' => 'lng'])!!}
                        @error('longitude')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{$message}}</strong>
                            </span>
                        @enderror

                        <div class="form-group increment">
                            <label for=""> Photo </label>
                            <div class="input-group">
                                <input type="file" name="photo[]" class="form-control">
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-primary btn-add"><i class="fas fa-plus-square"></i></button>
                                </div>
                            </div>
                        </div>
                        @if ($errors->has('photo'))
                            <ul class="alert alert-danger">
                                @foreach ($errors->get('photo') as $error)
                                    {{ $error }}
                                @endforeach
                            </ul>
                        @endif
                        <div class="clone invisible">
                            <div class="input-group mt-2">
                                <input type="file" name="photo[]" class="form-control">
                                <div class="input-group-append">
                                    <button type="button" class="btn btn-outline-danger btn-remove"><i class="fas fa-minus-square"></i></button>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-secondary my-4 float-right">Submit</button>
                    </div>
                    {!! Form::close() !!}
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('script')
    <script>
        window.action = "submit"
        $(function(){
            $('.btn-add').click(function(){
                let markup = $('.invisible').html();
                $('.increment').append(markup);
            });
            $('body').on('click','.btn-remove', function(){
                $(this).parents('.input-group').remove();
            })
        })
    </script>
@endpush