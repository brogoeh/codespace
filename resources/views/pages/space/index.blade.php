@extends('layouts.app')

@section('content')
<div class="container">
    <x-space></x-space>
    <div class="row justify-content-center">
        <div class="col-md-8">
                @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                @endif
            
                <div class="card-header">{{ __('Space!') }}</div>
            @foreach($spaces as $space)
            <div class="card">
                <div class="card-body">
                    @if ($space->user_id == Auth::user()->id)
                    <form action="{{ route('space.destroy', $space->id) }}" method="POST">
                        @csrf @method('DELETE')
                        <button class="btn btn-sm btn-danger float-right mt-2 mx-2" onclick="return confirm('are you sure delete this data?')"> Delete </button>
                        <a href="{{ route('space.edit', $space->id) }}" class="btn btn-sm btn-info float-right text-white mt-2"> Edit </a>
                    </form>
                    @endif
                    <h5 class="card-title">{{ $space->title }}</h5>
                    <h6 class="card-subtitle"> {{ $space->address }} </h6>
                    <div class="card-text"> {{ $space->description }} </div>
                    <a href="#" onclick="openDirection({{ $space->latitude }}, {{ $space->longitude }}, {{ $space->id }})" class="btn btn-sm btn-primary card-link"> Direction <i class="fas fa-paper-plane"></i></a>
                </div>
            </div>
            @endforeach
        </div>
    </div>
    <div class="justify-content-center row mt-2">
        {{ $spaces->links() }}
    </div>
</div>
@endsection
